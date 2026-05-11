# Hafif bir Python imajı kullanıyoruz (Cloud standartı)
FROM python:3.11-slim

# Çalışma dizini oluştur
WORKDIR /app

# Gerekli sistem paketlerini kur (bazı kütüphaneler için gerekebilir)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Gereksinim dosyalarını kopyala ve kur
# Not: Eğer birden fazla requirements varsa hepsini kopyalıyoruz
COPY energy/requirements.txt ./energy/
COPY symptom/requirements.txt ./symptom/
RUN pip install --no-cache-dir -r energy/requirements.txt
RUN pip install --no-cache-dir -r symptom/requirements.txt

# Uygulama kodunu kopyala
COPY . .

# Uygulamanın çalışacağı port (FastAPI genelde 8000 veya 80 kullanır)
EXPOSE 8000

# Uygulamayı başlat (Buradaki 'main:app' kısmını kendi giriş dosyana göre güncelle)
CMD ["uvicorn", "energy.main:app", "--host", "0.0.0.0", "--port", "8000"]