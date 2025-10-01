import pool from '../config/database';
import { User, CreateUserInput } from '../types';
import { PoolClient } from 'pg';

export class UserModel {
  static async createUser(userData: CreateUserInput & { verificationToken: string }): Promise<User> {
    const query = `
      INSERT INTO users (email, username, first_name, last_name, password, verification_token)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, username, first_name as "firstName", last_name as "lastName", 
                is_verified as "isVerified", is_profile_completed as "isProfileCompleted",
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const values = [
      userData.email,
      userData.username,
      userData.firstName,
      userData.lastName,
      userData.password,
      userData.verificationToken
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, username, first_name as "firstName", last_name as "lastName", 
             password, is_verified as "isVerified", is_profile_completed as "isProfileCompleted",
             verification_token as "verificationToken",
             reset_password_token as "resetPasswordToken", reset_password_expires as "resetPasswordExpires",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM users WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findByUsername(username: string): Promise<User | null> {
    const query = `
      SELECT id, email, username, first_name as "firstName", last_name as "lastName", 
             password, is_verified as "isVerified", is_profile_completed as "isProfileCompleted",
             verification_token as "verificationToken",
             reset_password_token as "resetPasswordToken", reset_password_expires as "resetPasswordExpires",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM users WHERE username = $1
    `;
    
    const result = await pool.query(query, [username]);
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, username, first_name as "firstName", last_name as "lastName", 
             password, is_verified as "isVerified", is_profile_completed as "isProfileCompleted",
             verification_token as "verificationToken",
             reset_password_token as "resetPasswordToken", reset_password_expires as "resetPasswordExpires",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM users WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async verifyUser(verificationToken: string): Promise<boolean> {
    const client: PoolClient = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // First check if the token exists and is valid
      const checkQuery = `
        SELECT id FROM users 
        WHERE verification_token = $1 AND is_verified = false
      `;
      
      const checkResult = await client.query(checkQuery, [verificationToken]);
      
      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return false;
      }
      
      // Update user as verified and remove verification token
      const updateQuery = `
        UPDATE users 
        SET is_verified = true, verification_token = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE verification_token = $1
      `;
      
      await client.query(updateQuery, [verificationToken]);
      await client.query('COMMIT');
      
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async setResetPasswordToken(email: string, resetToken: string): Promise<boolean> {
    const query = `
      UPDATE users 
      SET reset_password_token = $1, reset_password_expires = $2, updated_at = CURRENT_TIMESTAMP
      WHERE email = $3 AND is_verified = true
      RETURNING id
    `;
    
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
    const result = await pool.query(query, [resetToken, expiresAt, email]);
    
    return result.rows.length > 0;
  }

  static async resetPassword(resetToken: string, newPassword: string): Promise<boolean> {
    const client: PoolClient = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if reset token is valid and not expired
      const checkQuery = `
        SELECT id FROM users 
        WHERE reset_password_token = $1 AND reset_password_expires > CURRENT_TIMESTAMP
      `;
      
      const checkResult = await client.query(checkQuery, [resetToken]);
      
      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return false;
      }
      
      // Update password and clear reset token
      const updateQuery = `
        UPDATE users 
        SET password = $1, reset_password_token = NULL, reset_password_expires = NULL, 
            updated_at = CURRENT_TIMESTAMP
        WHERE reset_password_token = $2
      `;
      
      await client.query(updateQuery, [newPassword, resetToken]);
      await client.query('COMMIT');
      
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async updateLastLogin(userId: string): Promise<void> {
    const query = `
      UPDATE users 
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    
    await pool.query(query, [userId]);
  }

  static async updateVerificationToken(userId: string, verificationToken: string): Promise<void> {
    const query = `
      UPDATE users 
      SET verification_token = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    
    await pool.query(query, [verificationToken, userId]);
  }

  static async createGoogleUser(userData: CreateUserInput): Promise<User> {
    const query = `
      INSERT INTO users (email, username, first_name, last_name, password, is_verified, verification_token)
      VALUES ($1, $2, $3, $4, $5, true, NULL)
      RETURNING id, email, username, first_name as "firstName", last_name as "lastName", 
                is_verified as "isVerified", is_profile_completed as "isProfileCompleted",
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const values = [
      userData.email,
      userData.username,
      userData.firstName,
      userData.lastName,
      'GOOGLE_OAUTH_USER' // Placeholder password for Google users
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async verifyGoogleUser(email: string): Promise<boolean> {
    const query = `
      UPDATE users 
      SET is_verified = true, verification_token = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE email = $1
      RETURNING id
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows.length > 0;
  }

  static async setProfileCompleted(userId: string, isCompleted: boolean = true): Promise<boolean> {
    const query = `
      UPDATE users 
      SET is_profile_completed = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id
    `;
    
    const result = await pool.query(query, [isCompleted, userId]);
    return result.rows.length > 0;
  }
}
