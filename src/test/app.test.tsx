import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from '../App';
import { lessons, track } from '../content/track';
function mount(route='/'){return render(<MemoryRouter initialEntries={[route]}><App/></MemoryRouter>);}
describe('routes and honest preview states',()=>{
 it.each([['/','Good questions lead to discoveries.'],['/learn','Become a Data Detective.'],['/investigate','The Delivery Delay Mystery'],['/practice','Practice'],['/quiz','Quiz Arena'],['/skills','Skill DNA'],['/notebook','Evidence Notebook'],['/settings','Make room for your thinking.'],['/unknown','This page is outside the dataset.'],['/learn/unknown','Lesson not found']])('renders %s',(route,title)=>{mount(route);expect(screen.getByRole('heading',{level:1,name:title})).toBeInTheDocument();});
 it('navigates from dashboard into a lesson without recording completion',async()=>{mount();await userEvent.click(screen.getByRole('link',{name:/Continue learning/}));expect(screen.getByRole('heading',{level:1,name:'From hunch to hypothesis'})).toBeInTheDocument();expect(screen.getByText(/not saved or graded/)).toBeInTheDocument();});
 it('filters the curriculum and recovers from empty results',async()=>{mount('/learn');await userEvent.type(screen.getByRole('textbox',{name:'Find a chapter or lesson'}),'zzzz');expect(screen.getByText('No matching lessons')).toBeVisible();await userEvent.click(screen.getByRole('button',{name:'Clear search'}));expect(screen.getByRole('link',{name:/The anatomy of a dataset/})).toBeVisible();});
 it('reveals authored guidance and accepts a reflection',async()=>{mount('/learn/observations');await userEvent.type(screen.getByRole('textbox'),'Distance and weather');await userEvent.click(screen.getByRole('button',{name:'Show thinking guide'}));expect(screen.getByText(/authored reflection guide/)).toBeVisible();});
 it('switches analysis views and resets the editable draft',async()=>{mount('/investigate');await userEvent.click(screen.getByRole('button',{name:'Python'}));const editor=screen.getByRole('textbox',{name:'Python draft'});await userEvent.clear(editor);await userEvent.type(editor,'print(1)');await userEvent.click(screen.getByRole('button',{name:'Reset draft'}));expect((editor as HTMLTextAreaElement).value).toContain('Phase 4');expect(screen.getByText(/No code has been executed/)).toBeVisible();});
 it('persists only appearance preference',async()=>{mount('/settings');await userEvent.click(screen.getByRole('button',{name:'Light'}));expect(document.documentElement.dataset.theme).toBe('light');expect(localStorage.getItem('datum-theme')).toBe('light');});
 it('provides twelve uniquely identified, versioned previews',()=>{expect(track.version).toBe(1);expect(lessons).toHaveLength(12);expect(new Set(lessons.map(l=>l.id)).size).toBe(12);});
});


