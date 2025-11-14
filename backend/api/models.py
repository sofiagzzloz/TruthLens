from django.db import models

# Create your models here.
class User(models.Model):
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username
    
class Document(models.Model):
    document_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.title
    
class Sentence(models.Model):
    sentence_id = models.AutoField(primary_key=True)
    document_id = models.ForeignKey(Document, on_delete=models.CASCADE)
    content = models.TextField()
    start_index = models.IntegerField()
    end_index = models.IntegerField()
    flags = models.BooleanField(default=False)
    confidence_scores = models.IntegerField()

    def __str__(self):
        return f"Sentence {self.sentence_id} in Document {self.document_id}"

class Correction(models.Model):
    correction_id = models.AutoField(primary_key=True)
    sentence_id = models.ForeignKey(Sentence, on_delete=models.CASCADE)
    suggested_correction = models.TextField()
    reasoning = models.TextField()
    sources = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Correction {self.correction_id} for Sentence {self.sentence_id}"