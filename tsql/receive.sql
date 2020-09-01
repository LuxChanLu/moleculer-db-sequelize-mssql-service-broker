WAITFOR (RECEIVE TOP (:count)
    conversation_group_id,
    conversation_handle,
    message_sequence_number,
    message_body,
    message_type_id,
    message_type_name,
    priority,
    queuing_order,
    service_contract_id,
    service_contract_name,
    service_id,
    service_name,
    status,
    validation
  FROM [:queue]
), TIMEOUT :timeout;