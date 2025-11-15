FROM python:3.11-slim

# Prevents Python from buffering stdout
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN apt-get update && apt-get install -y curl postgresql-client

# Copy backend code
COPY . .

# Expose Django port
EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
