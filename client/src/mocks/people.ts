/** SAMPLE DATA: deterministic list used by the design-system table demo. */
export type SampleStudentStatus = 'active' | 'pending' | 'inactive';

export interface SampleStudent {
  id: string;
  name: string;
  email: string;
  className: string;
  guardian: string;
  status: SampleStudentStatus;
  admittedOn: string;
}

const firstNames = ['Aisha', 'Omar', 'Lina', 'Rafi', 'Mim', 'Tanvir', 'Sara', 'Imran', 'Nusrat', 'Zayan', 'Farah', 'Arif'];
const lastNames = ['Rahman', 'Hossain', 'Akter', 'Chowdhury', 'Islam', 'Karim', 'Sultana', 'Ahmed'];
const classes = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
const statuses: SampleStudentStatus[] = ['active', 'active', 'active', 'pending', 'active', 'inactive'];

export const sampleStudents: SampleStudent[] = Array.from({ length: 36 }, (_, index) => {
  const first = firstNames[index % firstNames.length] ?? 'Student';
  const last = lastNames[(index * 3 + 1) % lastNames.length] ?? 'Sample';
  const guardianFirst = firstNames[(index * 5 + 2) % firstNames.length] ?? 'Guardian';
  const month = String((index % 9) + 1).padStart(2, '0');
  const day = String((index % 27) + 1).padStart(2, '0');

  return {
    id: `student-${index + 1}`,
    name: `${first} ${last}`,
    email: `${first}.${last}${index + 1}@example.edu`.toLowerCase(),
    className: classes[index % classes.length] ?? 'Grade 6',
    guardian: `${guardianFirst} ${last}`,
    status: statuses[index % statuses.length] ?? 'active',
    admittedOn: `2025-${month}-${day}`,
  };
});
