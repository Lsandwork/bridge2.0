insert into parent_library_categories (slug, title, description) values
  ('understanding-autism', 'Understanding Autism', 'Core autism understanding across ages with respectful, strength-based support.'),
  ('communication-support', 'Communication Support', 'Practical AAC-first communication tools and routines.'),
  ('daily-living-skills', 'Daily Living Skills', 'Step-by-step routines for home, school, and community skills.'),
  ('emotional-regulation', 'Emotional Regulation', 'Tools for identifying feelings, calming safely, and repairing after stress.'),
  ('sensory-support', 'Sensory Support', 'Sensory profiles, accommodations, and environmental design.'),
  ('behavior-support', 'Behavior Support', 'Respectful behavior support focused on needs and replacement skills.'),
  ('social-stories', 'Social Stories Library', 'Editable social story templates for daily and community events.'),
  ('parent-coaching-plans', 'Parent Coaching Plans', 'Guided short and long-term implementation plans.'),
  ('crisis-overload-support', 'Crisis and Overload Support', 'Safety-focused support during and after overload.');

insert into parent_library_articles (category_id, title, body_markdown, evidence_notes)
select c.id, t.title, t.body, t.notes
from parent_library_categories c
join (
  values
    ('understanding-autism', 'Meltdowns vs tantrums', 'Purpose: help caregivers respond based on stress signals, not punishment. Practical: reduce language, reduce demands, protect safety, and recover together.', 'Cross-disciplinary neurodiversity-affirming guidance.'),
    ('communication-support', 'Use AAC during daily routines', 'Exercise: place phrase cards for **help**, **break**, **stop**, and **I need space** at meals, bath, transitions, and bedtime. Model use without requiring speech.', 'AAC should be available all day, not earned.'),
    ('daily-living-skills', 'Brushing teeth routine', 'Purpose: build hygiene independence with visual sequence and prompt fading. Include materials, 6 steps, visual option, and reward idea.', 'Task-analysis and prompt-fading approach.'),
    ('emotional-regulation', 'First calm, then solve', 'Teach a two-step script: (1) calm body and breathing, (2) solve problem after nervous system settles.', 'Co-regulation first improves problem-solving quality.'),
    ('sensory-support', 'What to track before assuming behavior is bad', 'Track sleep, hunger, transitions, noise, clothing discomfort, and communication demand before conclusions.', 'Antecedent pattern logging can reveal preventable overload.'),
    ('behavior-support', 'Replacement skills over punishment', 'Define likely function, teach communication replacement, practice in calm times, and reinforce attempts early.', 'Functional behavior support principles.'),
    ('social-stories', 'When plans change', 'Template includes preview, simple explanation, coping choice board, and repair statements.', 'Best outcomes with personalization and rehearsal.'),
    ('parent-coaching-plans', '7-day communication boost', 'Daily parent action + child activity + tracking + note prompt + reward idea.', 'Short coaching sprints improve adherence.'),
    ('crisis-overload-support', 'During overload safety guide', 'Lower demands, reduce input, use short validating language, protect physical safety, and avoid shame.', 'Safety-first de-escalation practice.')
) as t(category_slug, title, body, notes)
on c.slug = t.category_slug;

insert into communication_categories (name) values
  ('Food'),
  ('Bathroom'),
  ('Feelings'),
  ('Pain'),
  ('Help'),
  ('People'),
  ('Places'),
  ('Activities'),
  ('Yes / No'),
  ('Stop'),
  ('Break'),
  ('I need space'),
  ('I am overwhelmed'),
  ('I need help');

insert into coaching_plans (title, duration_days, summary) values
  ('7-day communication boost', 7, 'AAC-first communication supports with daily routines and fast feedback loops.'),
  ('7-day morning routine builder', 7, 'Visual morning routine setup and prompt fading for independence.'),
  ('14-day toilet routine support', 14, 'Predictable toileting supports with sensory and communication accommodations.'),
  ('14-day emotional regulation plan', 14, 'Daily body-signal awareness and calm-tool practice.'),
  ('30-day independence plan', 30, 'Daily living and executive function growth plan with measurable goals.'),
  ('30-day teen/adult life skills plan', 30, 'Age-respectful self-management, job readiness, and community skills.');

insert into social_story_templates (title, body_markdown, category) values
  ('Going to school', 'I can look at my schedule. I can ask for help. I can take a break when I need one.', 'school'),
  ('Going to work', 'Work has steps. I can use my checklist and ask for clear instructions.', 'work'),
  ('Doctor visit', 'The visit has a beginning, middle, and end. I can use my comfort item and communication board.', 'medical'),
  ('Dentist visit', 'I can ask for a pause. I can practice open-close with visuals first.', 'medical'),
  ('Internet safety', 'I do not share private information. If unsure, I ask a trusted adult.', 'safety'),
  ('Personal boundaries', 'My body belongs to me. I can say no and move away to safe space.', 'safety');
