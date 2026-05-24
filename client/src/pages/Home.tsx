import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Leaf, Play, FileText, Users, Mail, Phone, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // Importando nossa conexão

// Definição dos tipos de conteúdo do banco
interface Conteudo {
  id: number;
  titulo: string;
  descricao: string;
  tipo: 'video' | 'artigo' | 'pratica';
  url: string;
  criado_em: string;
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorNewsletter, setErrorNewsletter] = useState("");

  // Estados para guardar os dados reais vindo do Supabase
  const [videos, setVideos] = useState<Conteudo[]>([]);
  const [documentos, setDocumentos] = useState<Conteudo[]>([]);
  const [noticias, setNoticias] = useState<Conteudo[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar os dados dinamicamente do banco de dados ao abrir a página
  useEffect(() => {
    async function carregarConteudos() {
      try {
        const { data, error } = await supabase
          .from("conteudos")
          .select("*")
          .eq("status", "aprovado"); // Só traz o que o Admin aprovou

        if (error) throw error;

        if (data) {
          // Filtrando os conteúdos por tipo para renderizar nas seções certas
          setVideos(data.filter(c => c.type === "video" || c.tipo === "video"));
          setDocumentos(data.filter(c => c.type === "artigo" || c.tipo === "artigo"));
          setNoticias(data.filter(c => c.type === "pratica" || c.tipo === "pratica"));
        }
      } catch (err) {
        console.error("Erro ao buscar conteúdos do Supabase:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarConteudos();
  }, []);

  // Enviar e-mail da Newsletter para o banco real
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNewsletter("");

    try {
      const { error } = await supabase
        .from("newsletter")
        .insert([{ email }]);

      if (error) {
        if (error.code === "23505") {
          setErrorNewsletter("Este e-mail já está cadastrado!");
        } else {
          throw error;
        }
        return;
      }

      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      console.error("Erro ao salvar na newsletter:", err);
      setErrorNewsletter("Ocorreu um erro. Tente novamente mais tarde.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-accent" />
            <span className="text-xl font-bold text-foreground" style={{ fontFamily: "Playfair Display" }}>
              Agroecologia
            </span>
          </div>
          <div className="hidden md:flex gap-8">
            <a href="#videos" className="text-sm font-medium hover:text-accent transition-colors">Vídeos</a>
            <a href="#documentos" className="text-sm font-medium hover:text-accent transition-colors">Documentos</a>
            <a href="#noticias" className="text-sm font-medium hover:text-accent transition-colors">Notícias</a>
            <a href="#missao" className="text-sm font-medium hover:text-accent transition-colors">Missão</a>
            <a href="#contato" className="text-sm font-medium hover:text-accent transition-colors">Contato</a>
          </div>
          <a href="/admin">
            <Button variant="outline" size="sm" className="hidden md:flex">
              Admin
            </Button>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-between overflow-hidden pt-24 pb-16">
        <div className="absolute inset-0 z-0">
          <img
            src="/logo-front.jpeg"
            alt="Fazenda Sustentável"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/5"></div>
        </div>

        {/* Bloco de Cima: Apenas o Título Principal bem alto */}
        <div className="relative z-10 text-center text-black max-w-4xl mx-auto px-4 mt-4">
          <h1 className="text-5xl md:text-6xl font-bold drop-shadow-sm" style={{ fontFamily: "Playfair Display" }}>
            Agroecologia para um Futuro Sustentável
          </h1>
        </div>

        {/* Bloco de Baixo: Subtítulo posicionado logo ACIMA do Botão */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto px-4 mb-8 gap-6">
          <p className="text-lg md:text-xl font-bold text-black drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]" style={{ fontFamily: "Lato" }}>
            Conhecimento prático e teórico para transformar a agricultura em harmonia com a natureza
          </p>

          <a href="#videos">
            <Button size="lg" className="bg-[#6b8e6f] hover:bg-[#5a7a5e] text-white shadow-md font-medium px-8 py-6 text-base rounded-full transition-transform hover:scale-105">
              Explorar Conteúdo
            </Button>
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-accent text-accent-foreground py-16">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2" style={{ fontFamily: "Playfair Display" }}>{videos.length || "0"}</div>
            <p className="text-sm">Vídeos Ativos</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2" style={{ fontFamily: "Playfair Display" }}>{documentos.length || "0"}</div>
            <p className="text-sm">Documentos</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2" style={{ fontFamily: "Playfair Display" }}>{noticias.length || "0"}</div>
            <p className="text-sm">Artigos/Práticas</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2" style={{ fontFamily: "Playfair Display" }}>1000+</div>
            <p className="text-sm">Comunidade</p>
          </div>
        </div>
      </section>

      {/* Videos Section */}
      <section id="videos" className="py-20 bg-white">
        <div className="container">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "Playfair Display", color: "#3d2817" }}>
              Vídeos Educativos
            </h2>
            <p className="text-lg text-muted-foreground" style={{ fontFamily: "Lato" }}>
              Aprenda técnicas práticas de agroecologia em tempo real
            </p>
          </div>
          {loading ? (
            <p className="text-center text-muted-foreground">Carregando conteúdos ecológicos...</p>
          ) : videos.length === 0 ? (
            <p className="text-muted-foreground">Nenhum vídeo aprovado no banco de dados ainda.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative h-48 bg-muted flex items-center justify-center overflow-hidden">

                    {/* 🎬 MINIATURA DINÂMICA DO YOUTUBE */}
                    <img
                      src={`https://img.youtube.com/vi/${(() => {
                        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                        const match = video.url?.match(regExp);
                        return (match && match[2].length === 11) ? match[2] : 'default';
                      })()}/mqdefault.jpg`}
                      alt={video.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <a href={video.url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/30 flex items-center justify-center hover:bg-black/50 transition-colors">
                      <Play className="w-16 h-16 text-white drop-shadow-md" />
                    </a>
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold mb-2 text-lg" style={{ fontFamily: "Lora" }}>{video.titulo}</h3>
                    <p className="text-sm text-muted-foreground">{video.descricao}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Documents Section */}
      <section id="documentos" className="py-20 bg-secondary/10">
        <div className="container">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "Playfair Display", color: "#3d2817" }}>
              Documentos & Cartilhas
            </h2>
          </div>
          {documentos.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma cartilha cadastrada.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {documentos.map((doc) => (
                <Card key={doc.id} className="flex items-center gap-4 p-6 hover:shadow-lg transition-shadow">
                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <FileText className="w-8 h-8 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1" style={{ fontFamily: "Lora" }}>{doc.titulo}</h3>
                    <p className="text-sm text-muted-foreground">{doc.descricao}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.open(doc.url, '_blank')}>
                    Ver
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* News/Praticas Section */}
      <section id="noticias" className="py-20 bg-white">
        <div className="container">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "Playfair Display", color: "#3d2817" }}>
              Práticas Agroecológicas
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {noticias.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg" style={{ fontFamily: "Lora" }}>{item.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{item.descricao}</p>
                  {item.url && (
                    <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80" onClick={() => window.open(item.url, '_blank')}>
                      Saber Mais →
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="missao" className="py-20 bg-accent text-accent-foreground">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "Playfair Display" }}>Nossa Missão</h2>
              <p className="text-lg mb-6" style={{ fontFamily: "Lato" }}>
                Promover a agroecologia como caminho para a sustentabilidade, oferecendo conhecimento prático...
              </p>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden shadow-lg">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310419663028293218/5GLksnZft2pDeCvxLa3U7u/mission-section-Xs3yZAHsBGS6oudXLWk4qx.webp"
                alt="Nossa Comunidade"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Newsletter Section */}
      <section id="contato" className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "Playfair Display", color: "#3d2817" }}>
                Entre em Contato
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Mail className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1" style={{ fontFamily: "Lora" }}>Email</h3>
                    <p className="text-muted-foreground">contato@agroecologia.com.br</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Phone className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1" style={{ fontFamily: "Lora" }}>Telefone</h3>
                    <p className="text-muted-foreground">(11) 3000-0000</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter Card conectada ao Banco */}
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: "Playfair Display", color: "#3d2817" }}>
                Inscreva-se na Newsletter
              </h3>
              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Seu melhor email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-border"
                />
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white">
                  Inscrever-se
                </Button>
                {submitted && (
                  <p className="text-sm text-green-600 text-center font-medium">Parabéns! E-mail salvo no banco de dados.</p>
                )}
                {errorNewsletter && (
                  <p className="text-sm text-red-600 text-center font-medium">{errorNewsletter}</p>
                )}
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-accent-foreground py-12">
        <div className="container text-center text-sm opacity-80">
          <p>&copy; 2026 Aplicação Agroecológica. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}