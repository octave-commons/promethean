
# Advanced Security+ Comprehensive Drill Compendium $SY0-701$ – Expanded Edition

---

## **Domain 1 – Foundational Security Paradigms**

1. **Q:** Provide rigorous definitions for the three pillars of the Confidentiality–Integrity–Availability triad, identify the interdependence between these principles, and cite a historically documented security incident exemplifying the compromise of each.
	A: Confidentiality means you keep what you hear to your self, you sign NDAs, you keep secrets. You don't disclose PII, you don't disclose classified information, etc
	
	Integrity Is just... not selling out? Not accepting bribes? keeping to a code. Especially if your company/team/group has a especially laid out code of ops.
	
	Availability... less sure on this.... as it pertains to security. Like... the service it's self must remain available at all times. It is considered a compromise in security if someone can DDoS you. It prevents your company from doing it's usual work, and it's clients. It prevents the system from operating correctly.
	
2. **Q:** Compare and contrast the Principle of Least Privilege with the doctrine of Separation of Duties, specifically elucidating their respective prophylactic functions against collusion, fraud, and systemic misuse, with examples from both public and private sector contexts.
		A: The principal of least privilege is about ensuring that ever user has exactly the amount of permission they need to perform their duty, and any new permissions are granted slowly, incrementally. For example... I have a real world example of a situation where this was violated at a company. The company gave me access to literally... all of their share point... because they wanted me to make this magic AI system, over night, that could organize it all. This was at the very beginning of the AI hype, and they were desperate for an example to show to the DoD to possibly win a contract for doing it.  I built the system initially just using some random files. I was actually using it to study for my security plus exam. I made it quiz me, etc. They had me hook that up... to OpenAI. You guys. We gave it all to you.  These were files that required the CTO to directly give me permission to access. And we were giving them to a third party just to... test this thing we never even finished. That was an example of the principal of least privilege being violated. I shouldn't have needed access to that whole system. I should only have needed access to a server where users could be set up by the CTO/sys admins to access all of those files.
   
   I didn't need them to do my job. I wrote the software initially without them.
   
   The doctrine of separation.... I'm trying really hard here to not google this stuff, cause I want you to just work with me where I am now. 
   
   The doctrine of separation is like.... you keep different things... in different services.... if one service goes down, the rest of the system can continue to operate.
   
   Basically... the reason why micro services are a thing. They can be resource inefficient if done incorrectly, but separating them gives you not only dev benefits of knowing each is an isolated, independently testable unit, you also know that each is isolated, a compromise on one does not necessarily mean a compromise on the others, depending.
   
   
3. **Q:** Categorize a security awareness training initiative and a biometric authentication mechanism within the taxonomy of administrative, technical, and physical controls, and discuss the interplay between these controls in a defense-in-depth strategy.
	1. A: Don't use your biometric access to grant access to systems for those who are unauthorized. The system should be designed in such a way that a user cannot use their biometrics to allow another person in with out explicit permission to do so, and with the purpose well layed out. They should be confined only to the areas they need to be in. Ideally though, you just don't allow this to happen. This is an exception, not a rule. They should probably be granted temporary biometric access *if* they actually have a reason to enter. Or there should be some other mechanism in place, like a "guest" card, that will allow them *specifically* where they are suposed to be.
	

5. **Q:** Articulate the Zero Trust security model in a single, precise sentence, then analytically differentiate it from traditional perimeter-centric security postures, including the implications for distributed workforces and multi-cloud environments.
6. **Q:** State the formalized quantitative risk equation, delineate the conceptual divergence between inherent risk and residual risk in operational contexts, and provide an example illustrating the impact of compensating controls on residual risk.

---

## **Domain 2 – Threat Taxonomy, Vulnerability Exploitation, and Defensive Countermeasures**

6. **Q:** Accurately classify: Worm, Rootkit, Botnet, Logic Bomb, including operational characteristics, propagation mechanisms, and historical exemplars.
7. **Q:** Distinguish between Cross-Site Scripting and SQL Injection in terms of ingress vector, targeted component, canonical mitigation technique, and likely business impact if exploited.
8. **Q:** Dissect the tri-phasic social engineering lifecycle: pretexting → elicitation → exploitation, providing a plausible operational example for each and describing potential detection/prevention mechanisms.
9. **Q:** Given CVSS metrics (9.8 external RCE, 6.5 internal DoS, 8.0 privilege escalation), prioritize remediation order with justification grounded in threat modeling, business process criticality, and potential for lateral movement.
10. **Q:** Enumerate four behavioral and two technical indicators symptomatic of an emergent insider threat, and correlate these to early warning systems within a SOC environment.

---

## **Domain 3 – Security Architecture and Cryptographic Infrastructures**

11. **Q:** Map stateless firewalls, stateful inspection systems, and next-generation firewalls to their respective OSI model layer emphases, including a discussion of how NGFWs integrate intrusion prevention and application awareness.
12. **Q:** Critique the operational hazards of VPN split tunneling, analyze threat vectors it may expose, and delineate a narrowly defined scenario where its utilization is operationally defensible.
13. **Q:** Design a diagrammatic representation of a fortified DMZ incorporating a public web application, corporate email system, and internally sequestered database, annotating each security control and network segmentation boundary.
14. **Q:** Contrast AES and RSA with respect to cryptographic paradigm, prototypical application domain, computational efficiency, and resistance to contemporary cryptanalytic attacks.
15. **Q:** Analyze Certificate Revocation List (CRL) versus Online Certificate Status Protocol (OCSP) in terms of operational latency, scalability, trustworthiness, and implications for certificate validation in high-frequency transaction environments.

---

## **Domain 4 – Operational Security and Incident Orchestration**

16. **Q:** Sequentially enumerate NIST’s incident response phases, appending one exemplar activity to each stage, and describe inter-phase feedback loops for continuous improvement.
17. **Q:** Precisely rank: HDD, RAM, CPU registers, active network connections, and swap file by volatility, justifying your order based on forensic science principles.
18. **Q:** Construct a SIEM correlation rule capable of detecting brute-force authentication attempts with minimal false positives, including tuning parameters and baseline establishment methods.
19. **Q:** Define and differentiate Recovery Point Objective (RPO) from Recovery Time Objective (RTO); calculate permissible data loss and downtime for RPO = 4h, RTO = 1h, and explain the architectural implications for storage replication.
20. **Q:** Justify the necessity of pre-production patch validation in mission-critical, high-availability environments, incorporating both risk and change management perspectives.

---

## **Domain 5 – Governance, Risk Management, and Compliance Oversight**

21. **Q:** Differentiate Policies, Standards, Guidelines, and Procedures, providing a discrete operational example of each, and explain how they interlock to create a comprehensive governance framework.
22. **Q:** Correlate PCI-DSS, HIPAA, ISO 27001, and NIST CSF to their respective regulatory or framework mandates, noting overlaps and divergences in control objectives.
23. **Q:** Articulate avoidance, mitigation, transference, and acceptance as formalized risk treatment strategies, with a specific use case for each, and evaluate potential unintended consequences.
24. **Q:** Identify three indispensable contractual clauses to mitigate vendor-associated risk in a SaaS engagement, including examples of measurable SLAs tied to security performance.
25. **Q:** Evaluate the relative efficacy of annual, monolithic computer-based training versus continuous micro-learning paradigms, providing evidence-based rationale drawn from cognitive science and organizational behavior.

---

## **Integrated Performance-Based Scenarios**

26. **Scenario:** Implement firewall rules to categorically block inbound SMB traffic, permit HTTPS, and generate audit logs for all denied packets, documenting the rule set for compliance auditing.
27. **Scenario:** Upon a SIEM alert of five failed administrative logins within 30 seconds from an extraneous IP, enumerate the immediate triage sequence, including containment, verification, and escalation.
28. **Scenario:** Outline immediate isolation and containment measures for a corporate endpoint compromised by ransomware encryption, and describe post-containment forensic steps.
29. **Scenario:** With a stipulated RTO of 30 minutes, design a disaster recovery protocol responsive to a regional cloud service provider outage, addressing data replication, failover, and user communication.
30. **Scenario:** For a provided network log excerpt, classify the adversarial activity type, identify possible entry points, and prescribe a proportionate remediation strategy aligned with the organization’s risk appetite.
