DECLARE @DialogId UNIQUEIDENTIFIER
BEGIN DIALOG @DialogId
FROM SERVICE :from TO SERVICE ':to' ON CONTRACT :contract WITH ENCRYPTION = OFF;
SEND ON CONVERSATION @DialogId MESSAGE TYPE :type (:payload);