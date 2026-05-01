from django.shortcuts import render
from .models import que

def quizz(req):

    questions = que.objects.all()

    score = None

    if req.method == "POST":

        score = 0

        for q in questions:

            selected = req.POST.get(str(q.id))

            if selected == q.ans:
                score += 1

    return render(req,"quiz.html",{
        "questions": questions,
        "score": score
    })