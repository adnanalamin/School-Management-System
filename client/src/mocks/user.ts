/** SAMPLE DATA: stands in for the signed-in user until authentication exists. */
export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const sampleUser: CurrentUser = {
  id: 'sample-user',
  name: 'Nadia Rahman',
  email: 'nadia.rahman@example.edu',
  role: 'School administrator',
};
