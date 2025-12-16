import { AppDataSource } from '../data-source';
import { Permission, PermissionName } from '../../permissions/entities/permission.entity';
import { User } from '../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function runSeed() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    const permissionRepository = AppDataSource.getRepository(Permission);
    const userRepository = AppDataSource.getRepository(User);

    // Check if permissions already exist
    const existingPermissions = await permissionRepository.count();
    
    if (existingPermissions === 0) {
      // Create permissions
      const permissions = [
        {
          name: PermissionName.ADMIN,
          description: 'Permissão para administrar artigos e usuários. Ações: Ler, Criar, Editar e Apagar artigos e usuários.',
        },
        {
          name: PermissionName.EDITOR,
          description: 'Permissão para administrar artigos. Ações: Ler, Criar, Editar e Apagar artigos.',
        },
        {
          name: PermissionName.READER,
          description: 'Permissão para apenas ler artigos. Ações: Ler artigos.',
        },
      ];

      for (const permissionData of permissions) {
        const permission = permissionRepository.create(permissionData);
        await permissionRepository.save(permission);
        console.log(`Permission "${permission.name}" created.`);
      }
    } else {
      console.log('Permissions already exist, skipping...');
    }

    // Check if root user already exists
    const existingRoot = await userRepository.findOne({
      where: { email: 'root@admin.com' },
    });

    if (!existingRoot) {
      // Get admin permission
      const adminPermission = await permissionRepository.findOne({
        where: { name: PermissionName.ADMIN },
      });

      if (adminPermission) {
        // Create root user
        const hashedPassword = await bcrypt.hash('root123', 10);
        const rootUser = userRepository.create({
          name: 'Root Admin',
          email: 'root@admin.com',
          password: hashedPassword,
          permission: adminPermission,
        });

        await userRepository.save(rootUser);
        console.log('Root user created successfully!');
        console.log('Email: root@admin.com');
        console.log('Password: root123');
      }
    } else {
      console.log('Root user already exists, skipping...');
    }

    console.log('Seed completed successfully!');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

runSeed();
