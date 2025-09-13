import UniversityPage from "../../components/UniversityPage";

export default function Home({ params }) {
  const { univ } = params;
  return <UniversityPage univ={univ} />;
}
