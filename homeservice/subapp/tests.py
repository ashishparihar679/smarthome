import io
import tempfile
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from PIL import Image
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken

from .models import Booking, Review, Service, User, Worker


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
