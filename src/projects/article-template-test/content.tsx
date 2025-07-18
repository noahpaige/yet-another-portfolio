import React from "react";

export default function ArticleTemplateTestContent() {
  return (
    <div className="text-zinc-100">
      <h1>🧠 Personality and Mood for Non-Player Characters</h1>
      <h2>A Method for Behavior Simulation in a Maze Environment</h2>
      <h3>By Noah Paige</h3>

      <p>
        This project explores how to make non-player characters (NPCs) in video
        games feel more lifelike and believable—not just visually, but in how
        they behave and react emotionally. Drawing from real psychological
        models of personality and mood, I created a system where NPCs make
        decisions based on a mix of their personality traits and current
        emotional state. These traits impact how they act in a maze simulation,
        how they interact with each other, and even how their faces animate in
        real time. The result is a system where NPCs don't just follow rigid,
        scripted behaviors—they respond dynamically and sometimes unpredictably,
        creating more immersive, emergent gameplay. This kind of model could
        make future games more expressive and storytelling richer, while also
        saving time with procedural animation instead of manual animation work.
      </p>

      <h2>Introduction</h2>
      <p>
        Non-player characters (NPCs) are a staple in most modern games, yet they
        are often criticized for their lack of believability and emotional
        realism. This thesis tackles that problem by proposing a behavior model
        for NPCs that integrates psychological models—specifically, the{" "}
        <strong>Five-Factor Model of Personality</strong> and the{" "}
        <strong>Circumplex Model of Affect</strong>—to create more dynamic and
        emotionally responsive NPCs.
      </p>

      <p>
        The goal was to explore how personality and mood can be combined to
        produce emergent, unscripted behaviors in NPCs, which could enhance
        player immersion and narrative depth. To test the system, a maze
        simulation environment was built in Unity, where NPCs would navigate and
        interact based on their personalities and emotional states.
      </p>

      <h2>Background</h2>
      <h3>Role of NPCs in Games</h3>
      <p>
        NPCs play various roles in games—quest-givers, enemies, companions, or
        vendors. Yet many behave in limited, rigid ways due to reliance on
        traditional <strong>finite state machines</strong>, which lack
        flexibility in unpredictable situations. This leads to behavior that
        feels artificial and breaks immersion.
      </p>

      <h3>Five-Factor Model of Personality</h3>
      <p>
        Often referred to as the "Big Five," this model breaks personality into:
      </p>
      <ul>
        <li>
          <strong>Openness</strong>
        </li>
        <li>
          <strong>Conscientiousness</strong>
        </li>
        <li>
          <strong>Extraversion</strong>
        </li>
        <li>
          <strong>Agreeableness</strong>
        </li>
        <li>
          <strong>Neuroticism</strong>
        </li>
      </ul>
      <p>
        Each NPC is assigned a numerical value (0–1) for each trait, which
        influences their behavior.
      </p>

      <h3>Circumplex Model of Affect</h3>
      <p>
        This 2D model places emotions on a graph with axes for{" "}
        <strong>pleasantness</strong> and <strong>activation</strong> (energy).
        NPCs' current moods are represented as points on this graph, which shift
        over time based on their experiences. This model allows mood to
        fluctuate realistically.
      </p>

      <h3>Procedural Animation</h3>
      <p>
        Instead of using pre-recorded animations, this system uses{" "}
        <strong>blendshapes</strong>—facial expressions generated
        algorithmically based on mood. This approach saves time and produces
        more varied, reactive NPCs.
      </p>

      <h2>Related Work</h2>
      <p>
        Previous projects like Mac Namee's AI system, Li and MacDonnell's
        emotion-based models, and Georgeson's "Extreme AI Personality Engine"
        laid the groundwork. However, these often used simplified personality
        models or didn't combine personality with mood in real-time
        decision-making.
      </p>

      <p>
        This thesis builds on those ideas but integrates personality and mood
        into a <strong>behavior tree traversal</strong> and links it directly to
        real-time facial animation.
      </p>

      <h2>Proposed Method</h2>
      <p>Three main components were developed:</p>
      <ol>
        <li>
          <strong>A behavior model</strong> driven by personality and mood.
        </li>
        <li>
          <strong>A procedural facial animation system</strong> that reflects
          NPC mood.
        </li>
        <li>
          <strong>A maze simulation</strong> to observe emergent behaviors and
          interactions.
        </li>
      </ol>

      <h3>Behavior Model</h3>
      <p>
        NPCs choose from actions like "Go To Node", "Greet", "Follow", "Share",
        "Wait", and "Scan" based on:
      </p>
      <ul>
        <li>What they can see</li>
        <li>Their current mood and personality</li>
        <li>
          A <strong>potential value heuristic</strong> that estimates how a
          given action might move their mood closer to their "desired mood"
        </li>
      </ul>

      <p>Each action computes:</p>
      <ul>
        <li>
          <strong>EFactor</strong>: effect on energy
        </li>
        <li>
          <strong>PFactor</strong>: effect on pleasantness
        </li>
      </ul>
      <p>These influence the NPC's mood, which updates after each action.</p>

      <h3>Mood and Personality in Action</h3>
      <ul>
        <li>Personality traits determine an NPC's desired emotional state.</li>
        <li>Actions impact their current mood.</li>
        <li>
          The <strong>potential value</strong> of an action is how close it
          brings the NPC to their desired mood.
        </li>
        <li>
          NPCs prefer actions with high potential value and may interrupt
          actions mid-way to switch to something better.
        </li>
      </ul>

      <h2>Simulation Environment</h2>
      <p>
        A custom maze was built in Unity. Each NPC starts in a common area and
        tries to reach the exit, either alone or by collaborating with others.
      </p>

      <p>NPCs:</p>
      <ul>
        <li>Maintain a memory of visited nodes</li>
        <li>Have a perception score for each other NPC (ranging -1 to +1)</li>
        <li>Can share knowledge, follow others, or wait for companions</li>
      </ul>

      <p>
        This setup allows rich social dynamics to emerge, such as friendship,
        avoidance, or teamwork.
      </p>

      <h2>Procedural Animation</h2>
      <p>
        Mood-driven facial expressions are rendered using blendshapes. The NPC's
        mood coordinates on the circumplex graph determine which facial
        expressions are blended and displayed.
      </p>

      <p>
        This enables real-time visual feedback of internal emotional states
        without manual animation.
      </p>

      <h2>Results</h2>
      <h3>Emergent Behavior</h3>
      <p>
        100 iterations of the simulation showed clear correlations between
        personality traits and behavior choices. For example:
      </p>
      <ul>
        <li>
          NPCs high in <strong>conscientiousness</strong> explored more of the
          maze.
        </li>
        <li>
          NPCs high in <strong>extraversion</strong> were more likely to greet
          or follow others.
        </li>
        <li>
          <strong>Neurotic</strong> NPCs had stronger emotional fluctuations.
        </li>
      </ul>

      <h3>Procedural Animation Evaluation</h3>
      <p>
        The facial animation system successfully reflected mood changes. NPCs
        showed more lifelike expressions, helping viewers intuitively understand
        their emotional state.
      </p>

      <h2>Applications</h2>
      <p>
        This system could be applied to any game genre. Two specific examples
        are discussed:
      </p>
      <ul>
        <li>
          <strong>The Elder Scrolls V: Skyrim</strong> — Could enhance
          storytelling and quest design by making NPCs react differently based
          on their personality and mood.
        </li>
        <li>
          <strong>NBA 2K</strong> — Teammates and opponents could have unique
          playstyles and moods, changing how games unfold.
        </li>
      </ul>

      <h2>Future Work</h2>
      <p>Ideas for future development include:</p>
      <ul>
        <li>Using more granular personality traits (facets)</li>
        <li>Expanding mood models</li>
        <li>
          Improving procedural animations for body language, not just facial
          expressions
        </li>
        <li>Testing in more complex or varied environments</li>
      </ul>

      <h2>Conclusion</h2>
      <p>
        This thesis demonstrated that combining personality and mood models from
        psychology can dramatically improve the believability and behavior of
        NPCs. The integration of real-time emotion simulation and procedural
        facial animation creates characters that not only act differently but
        also feel emotionally alive—bringing us one step closer to the immersive
        realism often promised but rarely delivered in video games.
      </p>
    </div>
  );
}
