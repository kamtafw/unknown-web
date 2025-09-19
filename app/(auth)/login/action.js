'use server';

// import { afterLoginUrl } from "@/app-config";
// import { rateLimitByKey } from "@/lib/limiter";
// import { unauthenticatedAction } from "@/lib/safe-action";
// import { setSession } from "@/lib/session";
// import { signInUseCase } from "@/use-cases/users";
// import { redirect } from 'next/navigation';
// import { z } from 'zod';
// import { afterLoginUrl } from '../../../app-config';

// export const signInAction = unauthenticatedAction
//   .createServerAction()
//   .input(
//     z.object({
//       identifier: z.string(),
//       password: z.string().min(8),
//     })
//   )
//   .handler(async ({ input }) => {
//     await rateLimitByKey({ key: input.identifier, limit: 3, window: 10000 });
//     const user = await signInUseCase(input.identifier, input.password);
//     await setSession(user.id);
//     redirect(afterLoginUrl);
//   });
