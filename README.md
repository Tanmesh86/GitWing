# 🪶 GitWing – AI-Powered PR Analyzer

**GitWing** is an intelligent **AI-based Pull Request Analyzer** that helps developers merge with confidence.  
It reviews PRs with **syntactic tree–driven scoring** + **Ollama Phi-3 AI** and delivers precise, sentence-level feedback like:

- ⚠️ *Which file & line contains flaws*  
- 🛠️ *Why it’s not optimized*  
- ✅ *How to fix it effectively*  

Built with **React, Node.js, Express, MongoDB, and a microservices architecture**, GitWing is hosted on **Render** with its AI model running on **AWS EC2**.

---

## ✨ Features

- 🔐 **Authentication**: GitHub OAuth + JWT  
- 🤖 **AI Analysis**: Syntactic scoring + Ollama Phi-3 LLM  
- 🧩 **Microservices**: 4 services deployed on Render  
- 🎨 **Modern UI**: React + Tailwind CSS  
- ⚡ **DevOps Ready**: CI/CD with GitHub Actions + Docker  
- 📊 **Actionable Insights**: File-level & line-level suggestions  

---

## 🖥️ Tech Stack

**Frontend:** React, TailwindCSS  
**Backend:** Node.js, Express.js  
**Database:** MongoDB  
**AI Engine:** Ollama Phi-3 (AWS EC2)  
**Authentication:** GitHub OAuth + JWT  
**Infra & Hosting:** Render (microservices), AWS EC2 (AI model)  
**CI/CD:** GitHub Actions, Docker  

---

## 📐 System Architecture
 
flowchart TD
  A[GitHub PR] -->|OAuth| B[Auth Service]
  B --> C[PR Analyzer Service]
  C --> D[Syntactic Tree Scoring Engine]
  D --> E[Ollama Phi-3 Model on AWS EC2]
  E --> F[AI Feedback Service]
  F --> G[Frontend UI - React]
  C --> H[MongoDB] 



🚀 Getting Started
1️⃣ Clone Repo

git clone https://github.com/your-username/gitwing.git
cd gitwing

2️⃣ Install Dependencies
# Frontend
cd frontend && npm install

# Backend
For Each Microservice:
cd backend/service-name 
npm install 


Configure .env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
 
