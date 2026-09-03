import { redirect } from 'next/navigation';

export default function CoursesPage() {
  // Redirect to homepage with courses section
  redirect('/#courses');
}
