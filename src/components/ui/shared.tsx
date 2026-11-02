import type { ReactNode } from 'react';
import { ArrowUpRight, FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './button';
export function Badge({ children, tone = '' }: {children: ReactNode; tone?: string}) { return <span className={`badge ${tone}`}>{children}</span>; }
export function PageHeading({ eyebrow, title, description, children }: {eyebrow: string; title: string; description: string; children?: ReactNode}) { return <header className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="muted">{description}</p></div>{children}</header>; }
export function Upcoming({ title, phase, description }: {title: string; phase: number; description: string}) { return <section className="panel empty-state"><span className="icon-tile"><FlaskConical size={28}/></span><Badge>COMING IN PHASE {phase}</Badge><h2>{title}</h2><p>{description}</p><Button asChild variant="outline"><Link to="/learn">Explore the learning track <ArrowUpRight size={16}/></Link></Button></section>; }
