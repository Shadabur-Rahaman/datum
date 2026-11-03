-- Idempotent catalog only. Lesson copy stays in versioned authored content.
insert into public.content_items(id,version,kind,title,published) values
('observations',1,'lesson','The anatomy of a dataset',true),
('hypotheses',1,'lesson','From hunch to hypothesis',true),
('python-basics',1,'lesson','A language for investigation',true),
('processing',1,'lesson','Your first data pipeline',true),
('dataframes',1,'lesson','Meet the DataFrame',true),
('missing',1,'lesson','Missing is a signal',true),
('distributions',1,'lesson','Look beyond the average',true),
('charts',1,'lesson','Choose an honest chart',true),
('summary',1,'lesson','The typical delivery',true),
('uncertainty',1,'lesson','A sample is not the whole story',true),
('features',1,'lesson','From evidence to prediction',true),
('evaluation',1,'lesson','Put your model to the test',true),
('delivery-delay',1,'mission','The Delivery Delay Mystery',true)
on conflict(id,version) do nothing;
