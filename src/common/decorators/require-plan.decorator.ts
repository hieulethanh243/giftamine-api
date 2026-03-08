import { SetMetadata } from '@nestjs/common';
import { Plan } from '../enums/plan.enum';

export const PLAN_KEY = 'requiredPlan';
export const RequirePlan = (...plans: Plan[]) => SetMetadata(PLAN_KEY, plans);
