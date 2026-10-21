import io
import tempfile
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.utils import timezone
from PIL import Image
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken

from .models import Booking, City, Review, Service, User, Worker


class BookingAndReviewApiTests(APITestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.test_media = tempfile.TemporaryDirectory()
        cls.media_settings = override_settings(MEDIA_ROOT=cls.test_media.name)
        cls.media_settings.enable()

    @classmethod
    def tearDownClass(cls):
        cls.media_settings.disable()
        cls.test_media.cleanup()
        super().tearDownClass()

    def setUp(self):
        self.customer = User.objects.create_user(username='customer', email='customer@example.com', password='secure-password', phone='1111111111')
        self.other_customer = User.objects.create_user(username='other', email='other@example.com', password='secure-password', phone='2222222222')
        self.worker_user = User.objects.create_user(username='worker', email='worker@example.com', password='secure-password', phone='3333333333', role='WORKER')
        self.service = Service.objects.create(name='Plumbing')
        self.worker = Worker.objects.create(user=self.worker_user, name='Pro', phone='3333333333', service=self.service, approved=True, available=True)

    def tearDown(self):
        for professional in Worker.objects.exclude(profile_photo=''):
            professional.profile_photo.delete(save=False)

    def auth(self, user):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {AccessToken.for_user(user)}')

    def test_booking_uses_logged_in_customer_and_review_is_once_only(self):
        self.auth(self.customer)
        response = self.client.post('/bookings/', {'service': self.service.id, 'worker': self.worker.id, 'booking_date': '2030-05-10', 'address': '12 Main Street', 'problem_description': 'Leaking tap'})
        self.assertEqual(response.status_code, 201)
        booking = Booking.objects.get(pk=response.data['id'])
        self.assertEqual(booking.user, self.customer)
        self.assertEqual(booking.worker, self.worker)
        self.assertEqual(booking.status, 'PENDING')
        self.client.post(f'/bookings/{booking.id}/review/', {'rating': 5, 'comment': 'Great work'})
        self.assertEqual(Review.objects.count(), 0)
        booking.status = 'COMPLETED'
        booking.save()
        review = self.client.post(f'/bookings/{booking.id}/review/', {'rating': 5, 'comment': 'Great work'})
        self.assertEqual(review.status_code, 201)
        self.worker.refresh_from_db()
        self.assertEqual(float(self.worker.average_rating), 5.0)
        self.assertEqual(self.worker.rating_count, 1)
        saved_review = Review.objects.get(pk=review.data['id'])
        saved_review.rating = 3
        saved_review.save()
        self.worker.refresh_from_db()
        self.assertEqual(float(self.worker.average_rating), 3.0)
        services_response = self.client.get('/services/')
        self.assertEqual(float(services_response.data[0]['average_rating']), 3.0)
        self.assertEqual(services_response.data[0]['rating_count'], 1)
        duplicate = self.client.post(f'/bookings/{booking.id}/review/', {'rating': 4})
        self.assertEqual(duplicate.status_code, 409)
        saved_review.delete()
        self.worker.refresh_from_db()
        self.assertEqual(float(self.worker.average_rating), 0.0)
        self.assertEqual(self.worker.rating_count, 0)

    def test_customer_cannot_read_or_review_another_customers_booking(self):
        booking = Booking.objects.create(user=self.other_customer, worker=self.worker, service=self.service, booking_date='2030-05-10', address='Other address', status='COMPLETED')
        self.auth(self.customer)
        response = self.client.post(f'/bookings/{booking.id}/review/', {'rating': 4})
        self.assertEqual(response.status_code, 403)
        list_response = self.client.get('/bookings/')
        self.assertEqual(list_response.data, [])

    def test_rating_bounds_are_enforced(self):
        booking = Booking.objects.create(user=self.customer, worker=self.worker, service=self.service, booking_date='2030-05-10', address='Home', status='COMPLETED')
        self.auth(self.customer)
        response = self.client.post(f'/bookings/{booking.id}/review/', {'rating': 6})
        self.assertEqual(response.status_code, 400)

    def test_professional_registration_saves_skills_photo_and_pending_status(self):
        image_buffer = io.BytesIO()
        Image.new('RGB', (2, 2), color='blue').save(image_buffer, format='PNG')
        photo = SimpleUploadedFile('profile.png', image_buffer.getvalue(), content_type='image/png')
        response = self.client.post('/register/', {
            'username': 'newprofessional', 'password': 'secure-password', 'email': 'new@example.com',
            'phone': '4444444444', 'role': 'WORKER', 'first_name': 'Taylor', 'last_name': 'Pro',
            'service': self.service.id, 'experience': 4, 'service_area': 'Central', 'skills': 'Pipes, taps',
            'profile_photo': photo,
        }, format='multipart')
        self.assertEqual(response.status_code, 201)
        professional = Worker.objects.get(user__username='newprofessional')
        self.addCleanup(professional.profile_photo.delete, save=False)
        self.assertFalse(professional.approved)
        self.assertEqual(professional.skills, 'Pipes, taps')
        self.assertIn('profile', professional.profile_photo.name)


class AdminAnalyticsApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username='analytics-admin', email='analytics-admin@example.com', password='secure-password', phone='5551111111', role='ADMIN')
        self.customer = User.objects.create_user(username='analytics-customer', email='analytics-customer@example.com', password='secure-password', phone='5552222222')
        self.worker_user = User.objects.create_user(username='analytics-worker', email='analytics-worker@example.com', password='secure-password', phone='5553333333', role='WORKER')
        self.pending_worker_user = User.objects.create_user(username='pending-worker', email='pending-worker@example.com', password='secure-password', phone='5554444444', role='WORKER')
        self.service = Service.objects.create(name='AC repair')
        self.other_service = Service.objects.create(name='Painter')
        self.city = City.objects.create(name='Bhopal')
        self.worker = Worker.objects.create(user=self.worker_user, name='Available Pro', phone=self.worker_user.phone, service=self.service, service_area=' Bhopal ', approved=True, available=True)
        Worker.objects.create(user=self.pending_worker_user, name='Pending Pro', phone=self.pending_worker_user.phone, service=self.other_service, service_area='Bhopal', approved=False, available=True)
        self.completed_booking = Booking.objects.create(user=self.customer, worker=self.worker, service=self.service, booking_date=timezone.localdate(), address='12 Lake Road, BHOPAL', status='COMPLETED')
        self.pending_booking = Booking.objects.create(user=self.customer, worker=None, service=self.other_service, booking_date=timezone.localdate(), address='Unknown area', status='PENDING')
        Review.objects.create(booking=self.completed_booking, customer=self.customer, worker=self.worker, rating=4, comment='Good service')

    def auth(self, user):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {AccessToken.for_user(user)}')

    def test_analytics_are_admin_only_and_aggregate_real_records(self):
        denied = self.client.get('/admin/analytics/')
        self.assertEqual(denied.status_code, 401)
        self.auth(self.customer)
        denied = self.client.get('/admin/analytics/')
        self.assertEqual(denied.status_code, 403)

        self.auth(self.admin)
        response = self.client.get('/admin/analytics/', {
            'range': 'today', 'bucket': 'day', 'city': self.city.id,
            'service': self.service.id, 'status': 'COMPLETED',
        })
        self.assertEqual(response.status_code, 200)
        data = response.data
        self.assertEqual(data['global']['total'], 4)
        self.assertEqual(data['global']['customers'], 1)
        self.assertEqual(data['global']['registered_professionals'], 2)
        self.assertEqual(data['global']['administrators'], 1)
        self.assertEqual(data['global']['professionals'], 2)
        self.assertEqual(data['global']['pending_professional_approvals'], 1)
        self.assertEqual(data['global']['service_categories'], 2)
        self.assertEqual(data['global']['cities'], 1)
        self.assertEqual(data['global']['average_rating'], 4.0)
        self.assertEqual(data['period']['bookings']['total'], 1)
        self.assertEqual(data['period']['bookings']['completed'], 1)
        self.assertEqual(data['period']['bookings']['pending'], 0)
        self.assertEqual(data['cities'][0]['bookings'], 1)
        self.assertEqual(data['cities'][0]['customers_with_bookings'], 1)
        self.assertEqual(data['cities'][0]['available_professionals'], 1)
        self.assertEqual(data['cities'][0]['services'], ['AC repair'])
        self.assertEqual(len(data['services']), 1)
        self.assertEqual(data['services'][0]['completion_rate'], 100.0)
        self.assertEqual(data['services'][0]['average_rating'], 4.0)

    def test_analytics_validates_date_and_status_filters(self):
        self.auth(self.admin)
        invalid_dates = self.client.get('/admin/analytics/', {'range': 'custom', 'start': 'not-a-date', 'end': '2026-01-01'})
        self.assertEqual(invalid_dates.status_code, 400)
        invalid_status = self.client.get('/admin/analytics/', {'status': 'UNKNOWN'})
        self.assertEqual(invalid_status.status_code, 400)
