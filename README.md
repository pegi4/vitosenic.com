# vitosenic.com

My personal webpage and portfolio site, featuring an AI-powered chatbot that knows everything about me.

## 🚀 What I'm Building

A **RAG-powered personal website** where visitors can interact with an AI assistant that has deep knowledge about my experience, projects, and interests. Think of it as having a conversation with me, but the AI has access to my entire professional knowledge base.

### Key Features
- **AI Chatbot**: Ask me anything about my work, projects, or experience
- **RAG Integration**: The AI uses vector embeddings to search through my CV, projects, and notes
- **Incremental Indexing**: Smart content updates without re-embedding unchanged content
- **Real-time Knowledge**: Always up-to-date with my latest work and thoughts

## �� Design Inspiration

The design is inspired by [Michael Truell's minimalist approach](https://mntruell.com/) - clean, focused, and content-first. I've taken his elegant simplicity and added my own touches while keeping the same philosophy: **let the content speak for itself**.

> "I'm not that famous yet, so I upgraded his design a bit" - Vito Senič

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **AI/ML**: GitHub Models API, LangChain, RAG architecture
- **Database**: Supabase with pgvector for embeddings
- **Content**: Markdown files, JSON data, automatic indexing
- **Deployment**: Vercel (planned)

## 🔧 How It Works

1. **Content Indexing**: My CV, projects, and notes are automatically chunked and embedded
2. **Vector Search**: When you ask a question, the AI searches for relevant content
3. **Context-Aware Responses**: The AI generates answers based on my actual content
4. **Smart Updates**: Only new/changed content gets re-embedded (cost optimization)

## 🎯 Future Plans

- [ ] **Enhanced AI**: Better prompt engineering and conversation memory
- [ ] **Content Management**: Easy way to add new blog posts and projects
- [ ] **Analytics**: Track what people ask about most
- [ ] **Multi-language**: Support for different languages
- [ ] **Voice Interface**: Add voice chat capabilities

## �� Contributing

This is my personal site, but I'm open to suggestions and improvements! Feel free to:
- Report bugs or issues
- Suggest new features
- Share ideas for better AI integration
- Discuss RAG implementation approaches

## �� Learning Resources

If you're interested in building something similar:
- [LangChain Documentation](https://js.langchain.com/)
- [Supabase Vector Search](https://supabase.com/docs/guides/ai/vector-search)
- [RAG Best Practices](https://python.langchain.com/docs/use_cases/question_answering/)

## 📄 License

MIT License - feel free to use this as inspiration for your own projects!

---

**Built with heart and a lot of AI experimentation**
