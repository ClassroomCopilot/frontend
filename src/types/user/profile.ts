import { UserRole } from '../auth.types';
import { UserNodeInterface } from '../neo4j/nodes';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  workerDbName: string;
  instanceCount: number;
  neo4jNode: UserNodeInterface | null;
  createdAt: string;
  updatedAt: string;
}
