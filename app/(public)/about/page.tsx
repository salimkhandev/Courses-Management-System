import { redirect } from 'next/navigation';

export default function AboutPage() {
  // Redirect to homepage with about section
  redirect('/#about');
}
