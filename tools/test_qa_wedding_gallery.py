"""Generator regression checks that do not substitute for approved image QA."""
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
ROOT=Path(__file__).resolve().parents[1]

class WeddingGallery(unittest.TestCase):
    def test_gallery_and_translations_survive_repeated_generation(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)
            for name in ('tools/build_event_gifts.py','collections/home-decor/index.html','assets/js/language.js','index.html','event-gifts/catalog.json'):
                dst=root/name;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy(ROOT/name,dst)
            previous=None
            for _ in range(2):
                subprocess.run(['python3',str(root/'tools/build_event_gifts.py')],check=True)
                page=(root/'event-gifts/index.html').read_text();language=(root/'assets/js/language.js').read_text();home=(root/'index.html').read_text()
                self.assertEqual(page.count('class="event-section wul-wedding-gallery"'),1)
                self.assertEqual(page.count('data-wedding-photo='),2)
                self.assertLess(page.index('data-wedding-photo="original"'),page.index('data-wedding-photo="styled-concept"'))
                for name in ('original','styled-concept'):
                    for suffix in ('','-small'):
                        self.assertIn('wedding-magnets-'+name+suffix+'.webp',page)
                    self.assertIn('event.wedding.'+name+'.alt',language)
                    self.assertIn('event.wedding.'+name+'.caption',language)
                self.assertIn('צילום המוצר המקורי',page)
                self.assertIn('הדמיית קונספט — חריטה להמחשה',page)
                self.assertIn('../assets/css/event-wedding-feature.css',page)
                hero=page.split('<section class="event-hero">',1)[1].split('</section>',1)[0]
                self.assertNotIn('workshop',hero)
                self.assertIn('<picture>',hero)
                self.assertIn('wedding-magnets-styled-concept-small.webp',hero)
                self.assertIn('width="1122" height="1402"',hero)
                self.assertIn('הדמיית קונספט — חריטה להמחשה.',hero)
                self.assertIn('Concept visualization — illustrative engraving.',language)
                self.assertEqual(page.count('data-family='),4)
                self.assertEqual(home.count('class="wul-wedding-feature wrap"'),1)
                self.assertIn('data-i18n-alt="event.wedding.styled-concept.alt"',home)
                current=(page,language,home)
                if previous is not None:self.assertEqual(previous,current)
                previous=current

    def test_existing_contact_and_future_material_policy_remains_blocked(self):
        data=json.loads((ROOT/'event-gifts/catalog.json').read_text())
        self.assertEqual({m['id']:m['status'] for m in data['materials']},{'wood':'available','glass':'planned','mixed':'planned'})
        config=(ROOT/'inquiry/contact-config.js').read_text()
        for flag in ('formDestinationApproved','privacyApproved','contactDetailsApproved'):
            self.assertIn(flag+': false',config)

if __name__=='__main__':unittest.main(verbosity=2)
