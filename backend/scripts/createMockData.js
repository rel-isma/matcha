const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// ─── Database Configuration ───────────────────────────────────────────────────
const pool = new Pool({
  user:     process.env.DB_USER     || 'matcha_user',
  host:     process.env.DB_HOST     || 'postgres',
  database: process.env.DB_NAME     || 'matcha_db',
  password: process.env.DB_PASSWORD || 'matcha_password',
  port:     process.env.DB_PORT     || 5432,
});

// ─── Static Data ──────────────────────────────────────────────────────────────
const maleFirstNames = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher',
  'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua',
  'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Jason', 'Edward', 'Jeffrey', 'Ryan',
  'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon',
  'Benjamin', 'Samuel', 'Gregory', 'Alexander', 'Patrick', 'Frank', 'Raymond', 'Jack', 'Dennis', 'Jerry'
];

const femaleFirstNames = [
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
  'Nancy', 'Lisa', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle',
  'Laura', 'Kimberly', 'Deborah', 'Dorothy', 'Amy', 'Angela', 'Ashley', 'Brenda', 'Emma', 'Olivia',
  'Cynthia', 'Marie', 'Janet', 'Catherine', 'Frances', 'Ann', 'Joyce', 'Diane', 'Alice', 'Julie',
  'Heather', 'Teresa', 'Doris', 'Gloria', 'Evelyn', 'Jean', 'Cheryl', 'Mildred', 'Katherine', 'Joan'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const interests = [
  'photography', 'travel', 'cooking', 'hiking', 'music', 'reading', 'movies', 'fitness', 'yoga', 'dancing',
  'art', 'gaming', 'writing', 'swimming', 'cycling', 'running', 'meditation', 'fashion', 'technology', 'sports',
  'wine', 'coffee', 'concerts', 'theater', 'museums', 'nature', 'adventure', 'beach', 'mountains', 'camping',
  'skiing', 'surfing', 'sailing', 'rock climbing', 'martial arts', 'tennis', 'basketball', 'football', 'soccer', 'golf',
  'volunteering', 'languages', 'history', 'science', 'astronomy', 'gardening', 'interior design', 'architecture', 'cars', 'motorcycles'
];

const bioTemplates = [
  "Love exploring new places and trying different cuisines. Always up for an adventure!",
  "Passionate about {interests}. Looking for someone who shares similar interests.",
  "Coffee enthusiast by day, Netflix binge-watcher by night. Let's chat!",
  "Life is too short for boring conversations. Let's make it interesting!",
  "Fitness lover who enjoys outdoor activities. Swipe right if you love staying active!",
  "Art and culture enthusiast. Love visiting museums and galleries.",
  "Foodie who loves cooking and trying new restaurants. Let's grab dinner!",
  "Music lover who enjoys live concerts and festivals. What's your favorite band?",
  "Travel addict with stories to share. Where should we go next?",
  "Dog lover, yoga practitioner, and weekend hiker. Looking for my adventure buddy!",
  "Bookworm by day, social butterfly by night. Best of both worlds!",
  "Tech geek who loves innovation and gadgets. Let's talk about the future!",
  "Beach lover who enjoys surfing and sunset walks. Life's a beach!",
  "Wine enthusiast who loves trying new vintages. Cheers to new connections!",
  "Amateur chef who loves experimenting with recipes. Hungry for love and good food!"
];

const cities = [
  { name: 'Paris',       lat: 48.8566, lng:  2.3522, country: 'France'      },
  { name: 'Lyon',        lat: 45.7640, lng:  4.8357, country: 'France'      },
  { name: 'Marseille',   lat: 43.2965, lng:  5.3698, country: 'France'      },
  { name: 'Nice',        lat: 43.7102, lng:  7.2620, country: 'France'      },
  { name: 'Toulouse',    lat: 43.6047, lng:  1.4442, country: 'France'      },
  { name: 'Bordeaux',    lat: 44.8378, lng: -0.5792, country: 'France'      },
  { name: 'Lille',       lat: 50.6292, lng:  3.0573, country: 'France'      },
  { name: 'Strasbourg',  lat: 48.5734, lng:  7.7521, country: 'France'      },
  { name: 'Nantes',      lat: 47.2184, lng: -1.5536, country: 'France'      },
  { name: 'Montpellier', lat: 43.6110, lng:  3.8767, country: 'France'      },
  { name: 'London',      lat: 51.5074, lng: -0.1278, country: 'UK'          },
  { name: 'Berlin',      lat: 52.5200, lng: 13.4050, country: 'Germany'     },
  { name: 'Madrid',      lat: 40.4168, lng: -3.7038, country: 'Spain'       },
  { name: 'Rome',        lat: 41.9028, lng: 12.4964, country: 'Italy'       },
  { name: 'Amsterdam',   lat: 52.3676, lng:  4.9041, country: 'Netherlands' }
];

// ─── Picture URL Helpers ───────────────────────────────────────────────────────
// randomuser.me has portrait indices 1–99 per gender.
// To avoid the SAME portrait appearing on multiple profiles we hand out indices
// sequentially (wrapping only if we exceed 99 × however many extras we need).
// Each profile gets a FIXED "main" index so the URL is always unique per slot.

function getMalePictureUrl(portraitIndex) {
  // indices 1-99 are valid; wrap with modulo and offset by 1
  return `https://randomuser.me/api/portraits/men/${(portraitIndex % 99) + 1}.jpg`;
}

function getFemalePictureUrl(portraitIndex) {
  return `https://randomuser.me/api/portraits/women/${(portraitIndex % 99) + 1}.jpg`;
}

// Build a UNIQUE list of picture URLs for a profile.
// primaryIndex  – derived from the profile's loop counter (guarantees the
//                 profile picture is unique across all profiles).
// extraCount    – how many additional pictures to add (0-3).
// genderFn      – getMalePictureUrl | getFemalePictureUrl
// totalProfiles – total number of profiles of this gender (used to offset extras
//                 so they never collide with primary slots of other profiles).
function buildPictureUrls(primaryIndex, extraCount, genderFn, totalProfiles) {
  const urls = [];
  // Primary portrait – one unique index per profile
  urls.push(genderFn(primaryIndex));

  // Extra portraits sit in a separate "extra block" that starts after all
  // primary slots, so they never overlap with any profile's primary image.
  for (let e = 0; e < extraCount; e++) {
    const extraIndex = totalProfiles + primaryIndex * 3 + e;
    urls.push(genderFn(extraIndex));
  }
  return urls;
}

// ─── Utility Functions ────────────────────────────────────────────────────────
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count) {
  return [...array].sort(() => 0.5 - Math.random()).slice(0, count);
}

function generateBio(userInterests) {
  const template = getRandomElement(bioTemplates);
  if (template.includes('{interests}')) {
    return template.replace('{interests}', userInterests.slice(0, 2).join(' and '));
  }
  return template;
}

function addLocationVariation(lat, lng) {
  const variation = 0.2; // ~25 km
  return {
    lat: lat + (Math.random() - 0.5) * variation,
    lng: lng + (Math.random() - 0.5) * variation
  };
}

// ─── Profile Creator ──────────────────────────────────────────────────────────
async function createProfile(client, {
  index,
  gender,
  totalProfiles,
  hashedPassword,
}) {
  const isMale       = gender === 'male';
  const firstNames   = isMale ? maleFirstNames : femaleFirstNames;
  const suffix       = isMale ? 'm' : 'f';
  const genderFn     = isMale ? getMalePictureUrl : getFemalePictureUrl;
  const defaultPref  = isMale ? 'female' : 'male';

  const firstName    = getRandomElement(firstNames);
  const lastName     = getRandomElement(lastNames);
  const usernameBase = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
  const username     = `${usernameBase.substring(0, 14)}${suffix}${index.toString().padStart(3, '0')}`;
  const email        = `${username}@example.com`;
  const city         = getRandomElement(cities);
  const location     = addLocationVariation(city.lat, city.lng);

  // ── User row ──────────────────────────────────────────────────────────────
  const userResult = await client.query(`
    INSERT INTO users (email, username, first_name, last_name, password, is_verified, is_profile_completed)
    VALUES ($1, $2, $3, $4, $5, true, true)
    RETURNING id
  `, [email, username, firstName, lastName, hashedPassword]);

  const userId = userResult.rows[0].id;

  // ── Profile row ───────────────────────────────────────────────────────────
  const age         = Math.floor(Math.random() * 25) + 18;
  const dateOfBirth = new Date();
  dateOfBirth.setFullYear(dateOfBirth.getFullYear() - age);

  const userInterests    = getRandomElements(interests, Math.floor(Math.random() * 8) + 3);
  const bio              = generateBio(userInterests);
  const sexualPreference = Math.random() < 0.8
    ? defaultPref
    : getRandomElement(['male', 'female', 'both']);

  const profileResult = await client.query(`
    INSERT INTO profiles (user_id, gender, sexual_preference, bio, date_of_birth,
                          latitude, longitude, location_source, neighborhood,
                          fame_rating, completeness)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id
  `, [
    userId, gender, sexualPreference, bio, dateOfBirth,
    location.lat, location.lng, 'gps', `${city.name}, ${city.country}`,
    Math.floor(Math.random() * 100),
    85 + Math.floor(Math.random() * 15)
  ]);

  const profileId = profileResult.rows[0].id;

  // ── Interests ─────────────────────────────────────────────────────────────
  for (const interestName of userInterests) {
    const { rows } = await client.query(
      'SELECT id FROM interests WHERE name = $1',
      [interestName]
    );
    await client.query(
      'INSERT INTO profile_interests (profile_id, interest_id) VALUES ($1, $2)',
      [profileId, rows[0].id]
    );
  }

  // ── Profile pictures ──────────────────────────────────────────────────────
  // Each profile gets 1 primary + 0-3 extras.
  // All indices are assigned sequentially to guarantee no two profiles share
  // the same portrait URL, preventing the "same face" problem.
  const extraCount = Math.floor(Math.random() * 4); // 0-3 extra pictures
  const pictureUrls = buildPictureUrls(index, extraCount, genderFn, totalProfiles);

  for (let j = 0; j < pictureUrls.length; j++) {
    await client.query(`
      INSERT INTO profile_pictures (profile_id, url, is_profile_pic, position)
      VALUES ($1, $2, $3, $4)
    `, [profileId, pictureUrls[j], j === 0, j]);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function createMockData() {
  const client = await pool.connect();
  const TOTAL_PER_GENDER = 250;

  try {
    await client.query('BEGIN');

    console.log('Starting mock data creation...');
    const testResult = await client.query('SELECT NOW() as current_time');
    console.log('Database connected at:', testResult.rows[0].current_time);

    // ── Interests ─────────────────────────────────────────────────────────
    console.log('Creating interests...');
    for (const interest of interests) {
      await client.query(
        'INSERT INTO interests (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [interest]
      );
    }

    const hashedPassword = await bcrypt.hash('Password123!', 12);

    // ── Male profiles ─────────────────────────────────────────────────────
    console.log('Creating male profiles...');
    for (let i = 0; i < TOTAL_PER_GENDER; i++) {
      await createProfile(client, {
        index: i,
        gender: 'male',
        totalProfiles: TOTAL_PER_GENDER,
        hashedPassword,
      });
      if ((i + 1) % 50 === 0) console.log(`   ${i + 1}/${TOTAL_PER_GENDER} male profiles created`);
    }

    // ── Female profiles ───────────────────────────────────────────────────
    console.log('Creating female profiles...');
    for (let i = 0; i < TOTAL_PER_GENDER; i++) {
      await createProfile(client, {
        index: i,
        gender: 'female',
        totalProfiles: TOTAL_PER_GENDER,
        hashedPassword,
      });
      if ((i + 1) % 50 === 0) console.log(`   ${i + 1}/${TOTAL_PER_GENDER} female profiles created`);
    }

    // ── Interactions ──────────────────────────────────────────────────────
    console.log('Creating interactions...');
    const { rows: allUserRows } = await client.query(
      "SELECT id FROM users WHERE email LIKE '%@example.com'"
    );
    const allUserIds    = allUserRows.map(r => r.id);
    const likesToCreate = Math.floor((allUserIds.length ** 2 * 0.2) / 2);

    for (let i = 0; i < likesToCreate; i++) {
      const fromUser = getRandomElement(allUserIds);
      const toUser   = getRandomElement(allUserIds.filter(id => id !== fromUser));

      try {
        await client.query(
          'INSERT INTO likes (from_user, to_user) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [fromUser, toUser]
        );

        // 30 % chance of mutual like → creates a connection
        if (Math.random() < 0.3) {
          await client.query(
            'INSERT INTO likes (from_user, to_user) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [toUser, fromUser]
          );
          const userOne = fromUser < toUser ? fromUser : toUser;
          const userTwo = fromUser < toUser ? toUser   : fromUser;
          await client.query(
            'INSERT INTO connections (user_one, user_two) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userOne, userTwo]
          );
        }
      } catch (_) { /* ignore conflicts */ }
    }

    // Profile views (3× more than likes)
    for (let i = 0; i < likesToCreate * 3; i++) {
      const viewerId   = getRandomElement(allUserIds);
      const viewedUser = getRandomElement(allUserIds.filter(id => id !== viewerId));
      try {
        await client.query(
          'INSERT INTO profile_views (viewer_id, viewed_user) VALUES ($1, $2)',
          [viewerId, viewedUser]
        );
      } catch (_) { /* ignore */ }
    }

    // ── Fame ratings ──────────────────────────────────────────────────────
    console.log('Updating fame ratings...');
    for (const userId of allUserIds) {
      await client.query(`
        WITH fame_stats AS (
          SELECT
            p.user_id,
            COALESCE(COUNT(DISTINCT l.id), 0)                                                               AS likes_received,
            COALESCE(COUNT(DISTINCT pv.id) FILTER (WHERE pv.created_at > NOW() - INTERVAL '30 days'), 0)   AS views_last_30_days,
            p.completeness
          FROM profiles p
          LEFT JOIN likes         l  ON p.user_id = l.to_user
          LEFT JOIN profile_views pv ON p.user_id = pv.viewed_user
          WHERE p.user_id = $1
          GROUP BY p.user_id, p.completeness
        )
        UPDATE profiles
        SET fame_rating = LEAST(100, FLOOR(
          2   * ln(1 + fame_stats.likes_received) +
          0.5 * (fame_stats.views_last_30_days / 10.0) +
          fame_stats.completeness / 2
        ))
        FROM fame_stats
        WHERE profiles.user_id = fame_stats.user_id
      `, [userId]);
    }

    await client.query('COMMIT');

    console.log('\nMock data creation completed!');
    console.log('Summary:');
    console.log(`   • ${TOTAL_PER_GENDER * 2} users  (${TOTAL_PER_GENDER} male, ${TOTAL_PER_GENDER} female)`);
    console.log(`   • ${interests.length} interests`);
    console.log('   • Each profile has 1–4 UNIQUE portrait photos (no duplicates)');
    console.log('   • Realistic likes, connections and profile views');
    console.log('\nAll users → password: Password123!');
    console.log('Email format: [username]@example.com');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating mock data:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await createMockData();
    process.exit(0);
  } catch (error) {
    console.error('Failed to create mock data:', error);
    process.exit(1);
  }
}

main();