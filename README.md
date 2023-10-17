# ArtCrowd

schedule a sql command
```sql
UPDATE artcrowd_project SET status='sales closed' WHERE status='open' and deadline < now();
```