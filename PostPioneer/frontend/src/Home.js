import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "./firebase-ui-auth.css";
import "./App.css";
import firebaseConfig from "./firebaseConfig";
import imageSrc1 from "./post1.png"
import imageSrc2 from "./post2.png"
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        setUser(user);
        console.log("user already signed in:", user.email);
      } else {
        console.log("user not signed in");
      }
    });
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section
        className="bg-cover bg-center bg-no-repeat h-80 flex items-center justify-center relative"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?auto=format&fit=crop&w=1200&q=80")`,
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome to PostPioneer
          </h1>
          <p className="text-lg">Your AI-powered social media solution</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 py-10 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Sample Posts Section */}
          <div className="bg-white shadow-lg rounded-lg p-8 mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Explore Sample Posts
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              PostPioneer automatically curates engaging content for your brand.
              Here’s a sneak peek of what you can create:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sample Post #1 */}
              <div className="p-4 bg-gray-50 rounded shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Sample Post 1
                </h3>
                <img 
                  src={imageSrc1} 
                  alt="Scenic view of Japan" 
                  className="w-full h-48 object-cover rounded mb-2" 
                />
                <p className="text-gray-600">
                **Breaking Sports News: Updates from Around the World 🏈⚽**

Here’s your latest sports update! From football to F1 and everything in between, we’ve got you covered. Let’s dive into what’s trending:
<br></br>
<br></br>
---
<br></br>
<br></br>
**England in Focus:**
The Three Lions are making headlines with some big updates. JJ Watt has invested his time (and maybe even a little money?) in Burnley, taking Texas vibes all the way to Turf Moor! Meanwhile, the U-21 debate is heating up, and we’re not sure who’s more disappointed—fans or players? 🤷♂️
<br></br>
<br></br>
**F1 Excitement:**
<br></br>
Formula 1 has some exciting news on the horizon. Talks are underway for a potential Bangkok Grand Prix—could Thailand be the next big stop in F1 history? Stay tuned for more!
<br></br>
<br></br>
---
<br></br>
<br></br>
**Rangers Face Shame and Charges:**
<br></br>
Rangers have been handed a tough week after a banner incident that left fans cringing. Uefa charges are on the way, and let’s just say “shameful” might not even cover it… 💀
<br></br>
<br></br>
**Autism as an Advantage:**
<br></br>
In a powerful statement, Bronze shares how having autism has actually worked to his advantage in football. A reminder that diversity and different perspectives can lead to greatness! 🌟
<br></br>
<br></br>
---
<br></br>
<br></br>
**England Call-Ups and Switches:**
<br></br>
Henderson’s recall to the England squad is a huge win for him, while Pickford continues to solidify his place as a key player. Over in Scotland, Hirst’s switch has sparked debate, but one person who supports it? His ex-England striker dad! 👨⚽
<br></br>
<br></br>
**Champions Cup and Osaka Ambitions:**
<br></br>Care is calling the English Champions Cup win a “miraculous” achievement, and we’re not about to disagree. Meanwhile, Osaka is feeling confident after her Miami win, ready to “play with the big dogs.” 🐾
<br></br>
<br></br>
---
<br></br>
<br></br>
**Arsenal’s Pitch Problems:**
<br></br>
Conditions are no joke for Arsenal this season. Wright called the pitch a “disgrace,” and we can’t blame him—those fields need some serious TLC.
<br></br>
<br></br>
---
<br></br>
<br></br>
That’s your round-up of the latest sports news! Stay updated, stay passionate, and let us know which story caught your eye. 💪
<br></br>
<br></br>
#SportsNews #Football #F1 #England #Rangers #AutismAwareness #AthleteStories #ChampionsCup #Formula1 #SportsMoms
Post Pioneer Stable Diffusion Prompt Generation Test

                </p>
              </div>
              {/* Sample Post #2 */}
              <div className="p-4 bg-gray-50 rounded shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Sample Post 2
                </h3>
                <img 
                  src={imageSrc2} 
                  alt="Scenic view of Japan" 
                  className="w-full h-48 object-cover rounded mb-2" 
                />
                <p className="text-gray-600">
                🌸 Discover Japan 🌸 Where Tradition Meets Innovation! 🌍 Explore its rich history, vibrant cities, breathtaking landscapes, and unique culture. Indulge in sushi, ramen, and tea ceremonies. Experience festivals like Gion and the beauty of四季. Plan your adventure today! ✈️ #Japan #TravelGoals #CulturalHeritage #ModernInnovation
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-[#0073b1] rounded-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="mb-6">
              Sign up to start automating your social media content and watch
              your engagement soar!
            </p>

            {user ? (
              <a
                href="/post_generation"
                className="inline-block bg-white text-[#0073b1] px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
              >
                Generate a Post!
              </a>
            ) : (
              <a
                href="/Register"
                className="inline-block bg-white text-[#0073b1] px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
              >
                Sign Up
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
