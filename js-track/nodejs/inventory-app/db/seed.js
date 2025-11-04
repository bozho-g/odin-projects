const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function seed() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('Clearing existing data...');
        await client.query('DELETE FROM items');
        await client.query('DELETE FROM categories');

        console.log('Inserting categories...');
        const categoriesResult = await client.query(`
            INSERT INTO categories (name) VALUES
            ('Cars'),
            ('SUVs'),
            ('Trucks'),
            ('Buses'),
            ('Motorcycles')
            RETURNING id, name
        `);

        const categories = categoriesResult.rows;
        console.log('Categories inserted:', categories);

        const getCategoryId = (name) => categories.find(c => c.name === name).id;

        console.log('Inserting Cars...');
        await client.query(`
            INSERT INTO items (category_id, title, description, price, make, model, year, condition, mileage, color, power_hp, engine_size, engine_type, gearbox, images)
            VALUES
            ($1, 'BMW 320d Sedan', 'Excellent condition, full service history', 25000, 'BMW', '320d', 2020, 'Used', 45000, 'Black', 190, 2.0, 'Diesel', 'Automatic', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/2019_BMW_318d_SE_Automatic_2.0_Front.jpg']),
            ($1, 'Toyota Corolla Hybrid', 'Low mileage, fuel efficient, one owner', 22000, 'Toyota', 'Corolla', 2021, 'Used', 30000, 'White', 122, 1.8, 'Hybrid', 'Automatic', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/2018_Toyota_Corolla_(MZEA12R)_Ascent_Sport_hatchback_(2018-11-02)_01.jpg']),
            ($1, 'Mercedes-Benz C200', 'Luxury sedan with premium features', 35000, 'Mercedes-Benz', 'C200', 2019, 'Used', 60000, 'Silver', 184, 2.0, 'Petrol', 'Automatic', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/Mercedes-Benz_C_200_Avantgarde_(W_205)_%E2%80%93_Frontansicht%2C_26._April_2014%2C_D%C3%BCsseldorf.jpg']),
            ($1, 'Mercedes-Benz G63 AMG', 'Excellent condition, full service history', 100000, 'Mercedes-Benz', 'G63', 2019, 'Used', 45000, 'White', 585, 4.0, 'Petrol', 'Automatic', ARRAY['https://www.privatecollectionmotors.com/imagetag/357/main/l/Used-2019-Mercedes-Benz-G63-AMG-LOW-MILES!-AMG-G-63-1679177818.jpg']),
            ($1, 'Volkswagen Golf GTI', 'Sporty hatchback, well maintained', 28000, 'Volkswagen', 'Golf GTI', 2020, 'Used', 35000, 'Red', 245, 2.0, 'Petrol', 'Manual', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/2020_Volkswagen_Golf_Style_1.5_Front.jpg']),
            ($1, 'Audi A4 Avant', 'Station wagon, spacious and elegant', 32000, 'Audi', 'A4 Avant', 2021, 'Used', 25000, 'Blue', 190, 2.0, 'Diesel', 'Automatic', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/Audi_A4_B9_sedans_(FL)_1X7A2441.jpg']),
            ($1, 'Honda Civic Type R', 'Performance hatchback, track ready', 38000, 'Honda', 'Civic Type R', 2022, 'Used', 15000, 'White', 320, 2.0, 'Petrol', 'Manual', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/2024_Honda_Civic_Type_R%2C_front_right%2C_06-15-2024.jpg'])
        `, [getCategoryId('Cars')]);

        console.log('Inserting SUVs...');
        await client.query(`
            INSERT INTO items (category_id, title, description, price, make, model, year, condition, mileage, color, power_hp, engine_size, engine_type, gearbox, images)
            VALUES
            ($1, 'Toyota RAV4 Hybrid', 'All-wheel drive, perfect family SUV', 35000, 'Toyota', 'RAV4', 2021, 'Used', 40000, 'Gray', 222, 2.5, 'Hybrid', 'Automatic', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/2019_Toyota_RAV4_LE_2.5L_front_4.14.19.jpg']),
            ($1, 'BMW X5 xDrive', 'Premium SUV with all options', 55000, 'BMW', 'X5', 2020, 'Used', 50000, 'Black', 340, 3.0, 'Diesel', 'Automatic', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/2019_BMW_X5_M50d_Automatic_3.0.jpg']),
            ($1, 'Mazda CX-5 AWD', 'Reliable and stylish crossover', 28000, 'Mazda', 'CX-5', 2021, 'Used', 35000, 'Red', 194, 2.5, 'Petrol', 'Automatic', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/2024_Mazda_CX-5_2.5_S_Select_in_Platinum_Quartz_Metallic%2C_front_right.jpg']),
            ($1, 'Jeep Grand Cherokee', 'Off-road capable, luxury interior', 42000, 'Jeep', 'Grand Cherokee', 2020, 'Used', 45000, 'White', 286, 3.6, 'Petrol', 'Automatic', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/2022_Jeep_Grand_Cherokee_Summit_Reserve_4x4_in_Bright_White%2C_Front_Left%2C_01-16-2022.jpg']),
            ($1, 'Volvo XC60 T8', 'Plug-in hybrid, safety features', 48000, 'Volvo', 'XC60', 2021, 'Used', 30000, 'Blue', 390, 2.0, 'Hybrid', 'Automatic', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/2018_Volvo_XC60_R-Design_D5_P-Pulse_2.0_Front.jpg']),
            ($1, 'Land Rover Discovery', 'Seven seater, excellent off-road', 52000, 'Land Rover', 'Discovery', 2019, 'Used', 55000, 'Green', 306, 3.0, 'Diesel', 'Automatic', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/2018_Land_Rover_Discovery_Luxury_HSE_TD6_3.0_Front.jpg'])
        `, [getCategoryId('SUVs')]);

        console.log('Inserting Trucks...');
        await client.query(`
            INSERT INTO items (category_id, title, description, price, make, model, year, condition, mileage, color, power_hp, engine_size, engine_type, gearbox, images)
            VALUES
            ($1, 'Ford F-150 XLT', 'Powerful pickup, great for work and play', 38000, 'Ford', 'F-150', 2020, 'Used', 60000, 'Silver', 400, 5.0, 'Petrol', 'Automatic', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/Ford_F-150_Lariat_Luxury_2022.jpg']),
            ($1, 'Toyota Hilux Double Cab', 'Reliable workhorse, 4x4 capability', 32000, 'Toyota', 'Hilux', 2021, 'Used', 45000, 'White', 204, 2.8, 'Diesel', 'Manual', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/2016_Toyota_HiLux_Invincible_D-4D_4WD_2.4_Front.jpg']),
            ($1, 'RAM 1500 Laramie', 'Luxury pickup with premium interior', 45000, 'RAM', '1500', 2020, 'Used', 50000, 'Black', 395, 5.7, 'Petrol', 'Automatic', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/2017_Ram_1500_Express_Crew_Cab%2C_front_left%2C_09-02-2022.jpg']),
            ($1, 'Chevrolet Silverado', 'Heavy duty, towing capacity 12000 lbs', 42000, 'Chevrolet', 'Silverado', 2019, 'Used', 70000, 'Red', 420, 6.2, 'Petrol', 'Automatic', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/2022_Chevrolet_Silverado_2500HD_High_Country%2C_Front_Left%2C_11-21-2021.jpg']),
            ($1, 'Mercedes-Benz X-Class', 'Premium pickup truck, rare model', 38000, 'Mercedes-Benz', 'X-Class', 2019, 'Used', 55000, 'Gray', 190, 2.3, 'Diesel', 'Automatic', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/2018_Mercedes-Benz_X250_Power_D_4MATIC_Automatic_2.3_Front.jpg']),
            ($1, 'Nissan Navara Pro-4X', 'Off-road package, excellent condition', 30000, 'Nissan', 'Navara', 2021, 'Used', 40000, 'Blue', 190, 2.3, 'Diesel', 'Manual', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/2018_Nissan_Navara_Tekna_DCi_Automatic_2.3.jpg'])
        `, [getCategoryId('Trucks')]);

        console.log('Inserting Buses...');
        await client.query(`
            INSERT INTO items (category_id, title, description, price, make, model, year, condition, mileage, color, power_hp, engine_size, engine_type, gearbox, images)
            VALUES
            ($1, 'Mercedes-Benz Sprinter', '16 passenger minibus, ideal for tours', 48000, 'Mercedes-Benz', 'Sprinter 516', 2020, 'Used', 80000, 'White', 163, 2.1, 'Diesel', 'Automatic', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/2019_Mercedes-Benz_Sprinter_314_CDi_2.1.jpg']),
            ($1, 'Ford Transit Custom', '12 seater, perfect for small groups', 35000, 'Ford', 'Transit Custom', 2021, 'Used', 60000, 'Silver', 170, 2.0, 'Diesel', 'Manual', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/2024_Ford_Transit_Custom_Limited_TDCi_-_1996cc_2.0_(136PS)_Diesel_-_Artisan_Red_-_08-2024%2C_Front.jpg']),
            ($1, 'Volkswagen Crafter', '18 passenger bus, low mileage', 52000, 'Volkswagen', 'Crafter', 2020, 'Used', 50000, 'White', 177, 2.0, 'Diesel', 'Automatic', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/2017_Volkswagen_Crafter_CR35_Trendline_TD_2.0_Front.jpg']),
            ($1, 'Iveco Daily Minibus', '20 seater, great for school routes', 45000, 'Iveco', 'Daily', 2019, 'Used', 100000, 'Yellow', 180, 3.0, 'Diesel', 'Manual', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/2014_Iveco_Daily_35_S13_MWB_2.3.jpg']),
            ($1, 'Toyota Coaster', '25 passenger bus, reliable and comfortable', 58000, 'Toyota', 'Coaster', 2020, 'Used', 75000, 'White', 150, 4.0, 'Diesel', 'Automatic', ARRAY['https://www.toyota.com.jo/sites/default/files/styles/default/public/2020-07/Toyota%20Coaster%202020%20Financing%20Campaign%20IMG1.jpg?h=9b547093&itok=eaUCyOXo']),
            ($1, 'Renault Master Bus', '15 seater with wheelchair access', 42000, 'Renault', 'Master', 2021, 'Used', 55000, 'White', 170, 2.3, 'Diesel', 'Manual', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/Renault_Master_IV_DSC_7143.jpg'])
        `, [getCategoryId('Buses')]);

        console.log('Inserting Motorcycles...');
        await client.query(`
            INSERT INTO items (category_id, title, description, price, make, model, year, condition, mileage, color, power_hp, engine_size, engine_type, gearbox, images)
            VALUES
            ($1, 'Yamaha YZF-R6', 'Sport bike, track ready, low miles', 12000, 'Yamaha', 'YZF-R6', 2020, 'Used', 8000, 'Blue', 118, 0.6, 'Petrol', 'Manual', ARRAY['https://images-rajhraciek-cdn.rshop.sk/lgt/products/415f03bbd0ad129bc10eb8866ecc0711.jpg']),
            ($1, 'Honda CB500X', 'Adventure bike, perfect for touring', 7500, 'Honda', 'CB500X', 2021, 'Used', 12000, 'Red', 47, 0.5, 'Petrol', 'Manual', ARRAY['https://www.changecars.co.za/resources/ckuploads/xQAJlrBpYthj.jpg']),
            ($1, 'Kawasaki Ninja 650', 'Sport touring, comfortable and fast', 8500, 'Kawasaki', 'Ninja 650', 2020, 'Used', 10000, 'Green', 68, 0.65, 'Petrol', 'Manual', ARRAY['https://content2.kawasaki.com/ContentStorage/KMC/Products/9753/8862b26d-c72d-4ed6-88ae-e8548084cbbc.png?w=767']),
            ($1, 'BMW R1250GS', 'Adventure touring, fully loaded', 18000, 'BMW', 'R1250GS', 2021, 'Used', 15000, 'Gray', 136, 1.25, 'Petrol', 'Manual', ARRAY['https://commons.wikimedia.org/wiki/Special:FilePath/BMW_R1250GS_HP_2018-10-12.jpg']),
            ($1, 'Ducati Monster 821', 'Naked sport bike, Italian style', 11000, 'Ducati', 'Monster 821', 2019, 'Used', 18000, 'Red', 109, 0.82, 'Petrol', 'Manual', ARRAY['https://mcn-images.bauersecure.com/wp-images/4277/1440x960/ducati-monster-821-01.jpg?mode=max&quality=90&scale=down']),
            ($1, 'Harley-Davidson Street 750', 'Cruiser bike, classic American style', 8000, 'Harley-Davidson', 'Street 750', 2020, 'Used', 20000, 'Black', 53, 0.75, 'Petrol', 'Manual', ARRAY['https://cdn.dealerspike.com/imglib/v1/800x600/imglib/trimsdb/3331991-0-11090631.jpg']),
            ($1, 'Suzuki V-Strom 650', 'Dual sport, great for off-road', 7800, 'Suzuki', 'V-Strom 650', 2021, 'Used', 14000, 'Yellow', 71, 0.65, 'Petrol', 'Manual', ARRAY['https://www.suzuki.co.nz/images/assets/630566/11'])
        `, [getCategoryId('Motorcycles')]);

        await client.query('COMMIT');
        console.log('Seeding completed successfully!');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error seeding database:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

seed().catch(console.error);
