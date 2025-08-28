// Экспорт каталога для создания полного fallback
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function exportCatalog() {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        product_code as "productCode",
        name,
        unit,
        quantity,
        CASE collection
          WHEN 'Магия бетона' THEN 'concrete'
          WHEN 'Матовая эстетика' THEN 'matte'  
          WHEN 'Мраморная феерия' THEN 'marble'
          WHEN 'Тканевая роскошь' THEN 'fabric'
          ELSE 'concrete'
        END as collection,
        color,
        surface,
        format,
        area_per_package as "areaPerPackage",
        pcs_per_package as "pcsPerPackage",
        price,
        barcode,
        category,
        availability,
        sort_order as "sortOrder"
      FROM catalog_products 
      WHERE is_active = 1 
        AND product_code NOT LIKE 'AUTO_%'
      ORDER BY sort_order
    `);

    const fallbackProducts = result.rows.map(row => ({
      ...row,
      imageUrl: null,
      images: [],
      description: null,
      specifications: {},
      profile: null,
      isActive: 1,
      createdAt: "new Date()",
      updatedAt: "new Date()"
    }));

    console.log('export const FALLBACK_CATALOG = [');
    fallbackProducts.forEach((product, index) => {
      console.log('  {');
      Object.entries(product).forEach(([key, value]) => {
        if (value === null) {
          console.log(`    ${key}: null,`);
        } else if (typeof value === 'string' && value !== "new Date()") {
          console.log(`    ${key}: "${value}",`);
        } else if (Array.isArray(value)) {
          console.log(`    ${key}: [],`);
        } else if (typeof value === 'object' && value !== null) {
          console.log(`    ${key}: {},`);
        } else {
          console.log(`    ${key}: ${value},`);
        }
      });
      console.log('  }' + (index < fallbackProducts.length - 1 ? ',' : ''));
    });
    console.log('];');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

exportCatalog();