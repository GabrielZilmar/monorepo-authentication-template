import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import Env from '~/shared/env';

export default class UsersSeeder implements Seeder {
  /**
   * Track seeder execution.
   */
  track = true;

  public async run(dataSource: DataSource): Promise<void> {
    await dataSource.manager.transaction(async (manager) => {
      const userRepository = manager.getRepository('User');

      const adminUser = userRepository.create({
        email: Env.adminEmail,
        username: Env.adminUsername,
        password: Env.adminPassword,
        isAdmin: true,
      });
      await userRepository.save(adminUser);
    });
  }
}
