import 'dotenv/config';
import AppDataSource from '../config/typeorm';
import { User, UserRole } from '../users/user.entity';
import { Profile } from '../profiles/profile.entity';
import * as bcrypt from 'bcryptjs';

async function seedAdmins() {
  // Array of admins to create
  const admins = [
    {
      email: process.env.ADMIN_EMAIL_1 || 'admin1@ivrex.co.ls',
      password: process.env.ADMIN_PASSWORD_1 || 'Admin@123',
      firstName: 'Default',
      lastName: 'AdminOne',
    },
    {
      email: process.env.ADMIN_EMAIL_2 || 'admin2@ivrex.co.ls',
      password: process.env.ADMIN_PASSWORD_2 || 'Admin@123',
      firstName: 'Default',
      lastName: 'AdminTwo',
    },
  ];

  try {
    const dataSource = await AppDataSource.initialize();
    const userRepository = dataSource.getRepository(User);
    const profileRepository = dataSource.getRepository(Profile);

    for (const admin of admins) {
      const existingAdmin = await userRepository.findOne({
        where: { email: admin.email },
      });

      if (existingAdmin) {
        console.log(`✅ Admin already exists: ${admin.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(admin.password, 10);

      // Create profile
      const adminProfile = profileRepository.create({
        firstName: admin.firstName,
        lastName: admin.lastName,
      });
      await profileRepository.save(adminProfile);

      // Create admin user
      const adminUser = userRepository.create({
        email: admin.email,
        password: hashedPassword,
        role: UserRole.ADMIN,
        profile: adminProfile,
        isActive: true,
      });

      await userRepository.save(adminUser);
      console.log(`✅ Created admin: ${admin.email}`);
    }
  } catch (err) {
    console.error('❌ Error creating admins:', err);
  } finally {
    await AppDataSource.destroy();
  }
}

seedAdmins();
