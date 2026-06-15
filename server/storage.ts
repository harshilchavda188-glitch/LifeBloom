import * as db from "./database";

export interface IStorage {
  getUser(id: string): Promise<db.User | undefined>;
  getUserByUsername(username: string): Promise<db.User | undefined>;
  createUser(user: { username: string; password: string }): Promise<db.User>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<db.User | undefined> {
    return db.getUser(id);
  }

  async getUserByUsername(username: string): Promise<db.User | undefined> {
    return db.getUserByUsername(username);
  }

  async createUser(user: { username: string; password: string }): Promise<db.User> {
    return db.createUser(user);
  }
}

export const storage = new DbStorage();
