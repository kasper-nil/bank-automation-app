import { relations } from "drizzle-orm/relations";
import { user, account, session, sparebankConnection } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	sparebankConnections: many(sparebankConnection),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const sparebankConnectionRelations = relations(sparebankConnection, ({one}) => ({
	user: one(user, {
		fields: [sparebankConnection.userId],
		references: [user.id]
	}),
}));