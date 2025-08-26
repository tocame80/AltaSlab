#!/usr/bin/env python3
import pandas as pd
import json
import psycopg2
import os
from datetime import datetime

# Подключение к базе данных
db_url = os.environ.get('DATABASE_URL')
if not db_url:
    print("DATABASE_URL not found")
    exit(1)

try:
    # Читаем Excel файл
    df = pd.read_excel('attached_assets/Каталог Slab для сайта_1756208983762.xlsx')
    
    print(f"Загружен Excel файл с {len(df)} строками")
    print("Колонки:", df.columns.tolist())
    
    # Показываем первые несколько строк для понимания структуры
    print("\nПервые 5 строк:")
    print(df.head())
    
    # Подключаемся к базе данных
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # Очищаем существующие данные каталога
    cur.execute("DELETE FROM catalog_products WHERE collection != 'ТЕСТОВАЯ'")
    
    # Счетчик добавленных записей
    added_count = 0
    
    for index, row in df.iterrows():
        try:
            # Пропускаем пустые строки и заголовок
            if pd.isna(row.get('Название товара', '')) or str(row.get('Название товара', '')).strip() == '':
                continue
                
            # Маппинг колонок из Excel в наши поля
            article = row.get('Артикул', '')
            product_code = f"SPC{int(article)}" if not pd.isna(article) and article != '' else f'AUTO_{index}'
            
            # Подготавливаем данные
            product_data = {
                'product_code': str(product_code).strip(),
                'name': str(row.get('Название товара', '')).strip(),
                'unit': str(row.get('Единица измерения', 'упак')).strip(),
                'quantity': int(row.get('Количество', 0)) if not pd.isna(row.get('Количество', 0)) else 0,
                'pieces_per_pack': int(row.get('Шт в уп', 1)) if not pd.isna(row.get('Шт в уп', 1)) else 1,
                'barcode': str(row.get('Штрихкод упаковки', '')).strip() if not pd.isna(row.get('Штрихкод упаковки', '')) else None,
                'price': str(row.get('Цена за единицу измерения', '0')).strip(),
                'category': 'SPC панели',
                'collection': str(row.get('Коллекция', '')).strip(),
                'color': str(row.get('Цвета', '')).strip() if not pd.isna(row.get('Цвета', '')) else 'Стандарт',
                'format': '',  # Будем извлекать из названия
                'surface': 'упак',
                'image_url': str(row.get('Ссылки на фото', '')).strip() if not pd.isna(row.get('Ссылки на фото', '')) else None,
                'description': f"Панель {row.get('Название товара', '')}",
                'availability': str(row.get('Наличие ', 'В наличии')).strip(),
                'sort_order': index
            }
            
            # Извлекаем формат из названия товара
            name = product_data['name']
            if '×' in name:
                # Ищем размеры типа 300×600×2,4мм
                import re
                format_match = re.search(r'(\d+×\d+×[\d,]+мм)', name)
                if format_match:
                    product_data['format'] = format_match.group(1)
            
            # Обрабатываем изображения
            images = []
            if not pd.isna(row.get('images', '')):
                try:
                    images = json.loads(str(row.get('images', '[]')))
                except:
                    images = [str(row.get('images', ''))]
            elif product_data['image_url']:
                images = [product_data['image_url']]
            
            # Обрабатываем спецификации
            specifications = {}
            if not pd.isna(row.get('specifications', '')):
                try:
                    specifications = json.loads(str(row.get('specifications', '{}')))
                except:
                    specifications = {"description": str(row.get('specifications', ''))}
            
            # Вставляем в базу данных
            insert_query = """
            INSERT INTO catalog_products (
                id, product_code, name, unit, quantity, barcode, price, category, 
                collection, color, format, surface, image_url, images, description, 
                specifications, profile, availability, is_active, sort_order, 
                created_at, updated_at
            ) VALUES (
                gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            """
            
            cur.execute(insert_query, (
                product_data['product_code'],
                product_data['name'],
                product_data['unit'],
                product_data['quantity'],
                product_data['barcode'],
                product_data['price'],
                product_data['category'],
                product_data['collection'],
                product_data['color'],
                product_data['format'],
                product_data['surface'],
                product_data['image_url'],
                json.dumps(images),
                product_data['description'],
                json.dumps(specifications),
                None,  # profile
                product_data['availability'],
                1,  # is_active
                product_data['sort_order'],
                datetime.now(),
                datetime.now()
            ))
            
            added_count += 1
            
        except Exception as e:
            print(f"Ошибка при обработке строки {index}: {e}")
            continue
    
    # Сохраняем изменения
    conn.commit()
    
    print(f"\nУспешно загружено {added_count} товаров в каталог")
    
    # Показываем статистику по коллекциям
    cur.execute("SELECT collection, COUNT(*) as count FROM catalog_products GROUP BY collection ORDER BY collection")
    collections = cur.fetchall()
    print("\nСтатистика по коллекциям:")
    for collection, count in collections:
        print(f"  {collection}: {count} товаров")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"Ошибка: {e}")
    exit(1)