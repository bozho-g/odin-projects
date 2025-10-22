import './styles/App.css';
import Section from './components/Section';
import Info from './components/info';
import { Items } from './components/Items';
import ExperienceItem from './components/Experience';
import EducationItem from './components/Education';

function App() {
  return (
    <>
      <Section>
        <Info />
      </Section>

      <Section>
        <Items
          type="experience"
          initialItems={[
            { id: 1, companyName: "Company A", startMonth: "Jan", startYear: 2020, endMonth: "Dec", endYear: 2021, jobTitle: "Developer", location: "City, ST", jobDescription: "Developed and maintained web applications using React and Node.js." }
          ]}
          ItemComponent={ExperienceItem}
          newItemTemplate={{ id: Date.now(), companyName: "", startMonth: "", startYear: "", endMonth: "", endYear: "", jobTitle: "", location: "", jobDescription: "" }}
        />
      </Section>

      <Section>
        <Items
          type="education"
          initialItems={[
            { id: 1, universityName: "University Name", endMonth: "Dec", endYear: 2021, info: "Degree, Honors, GPA" }
          ]}
          ItemComponent={EducationItem}
          newItemTemplate={{ id: Date.now(), universityName: "", endMonth: "", endYear: "", info: "" }}
        />
      </Section>
    </>
  );
}

export default App;
