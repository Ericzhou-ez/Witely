ALTER TABLE "PersonalInformation" RENAME TO "Personalization";--> statement-breakpoint
ALTER TABLE "Personalization" DROP CONSTRAINT "PersonalInformation_userId_User_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Personalization" ADD CONSTRAINT "Personalization_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
