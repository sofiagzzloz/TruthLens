from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import User, Document, Sentence, Correction

@admin.register(User)
class UserAdmin(ModelAdmin):
    list_display = ('user_id', 'username', 'email', 'created_at', 'updated_at')
    search_fields = ('username', 'email')

@admin.register(Document)
class DocumentAdmin(ModelAdmin):
    list_display = ('document_id', 'title', 'user_id', 'created_at', 'updated_at')
    search_fields = ('title',)

@admin.register(Sentence)
class SentenceAdmin(ModelAdmin):
    list_display = ('sentence_id', 'document_id', 'start_index', 'end_index', 'flags', 'confidence_scores')
    search_fields = ('content',)

@admin.register(Correction)
class CorrectionAdmin(ModelAdmin):
    list_display = ('correction_id', 'sentence_id', 'created_at', 'updated_at')
    search_fields = ('suggested_correction', 'reasoning', 'sources')