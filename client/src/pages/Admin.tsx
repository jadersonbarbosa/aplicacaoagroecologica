import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, LogOut, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

interface Video {
  id: string;
  title: string;
  url: string;
  duration: string;
}

interface Document {
  id: string;
  title: string;
  type: string;
  pages: string;
  url: string;
}

interface News {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

const ADMIN_PASSWORD = "agroecologia2024";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const [videos, setVideos] = useState<Video[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  const [newVideo, setNewVideo] = useState({ title: "", url: "", duration: "" });
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  const [newDoc, setNewDoc] = useState({ title: "", type: "PDF", pages: "", url: "" });
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);

  const [newNews, setNewNews] = useState({ title: "", date: "", excerpt: "", content: "" });
  const [editingNews, setEditingNews] = useState<News | null>(null);

  async function carregarDadosDoBanco() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("conteudos").select("*");
      if (error) throw error;

      if (data) {
        const videosDoBanco = data.filter(c => c.tipo === 'video').map(c => ({
          id: c.id.toString(), title: c.titulo, url: c.url, duration: c.descricao || ""
        }));
        const docsDoBanco = data.filter(c => c.tipo === 'artigo').map(c => ({
          id: c.id.toString(), title: c.titulo, type: "PDF", pages: c.descricao || "", url: c.url
        }));
        const newsDoBanco = data.filter(c => c.tipo === 'pratica').map(c => ({
          id: c.id.toString(), title: c.titulo, date: "Atualizado", excerpt: c.descricao || "", content: c.url || ""
        }));

        setVideos(videosDoBanco);
        setDocuments(docsDoBanco);
        setNews(newsDoBanco);
      }
    } catch (err) {
      console.error("Erro ao sincronizar com o Supabase:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      carregarDadosDoBanco();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword("");
    } else {
      alert("Senha incorreta!");
    }
  };

  // HANDLERS
  const addVideo = async () => {
    if (newVideo.title && newVideo.url) {
      const { error } = await supabase.from("conteudos").insert([
        { titulo: newVideo.title, url: newVideo.url, descricao: newVideo.duration, tipo: "video", status: "aprovado" }
      ]);
      if (!error) {
        setNewVideo({ title: "", url: "", duration: "" });
        carregarDadosDoBanco();
      }
    }
  };

  const updateVideo = async () => {
    if (editingVideo) {
      const { error } = await supabase
        .from("conteudos")
        .update({
          titulo: editingVideo.title,
          url: editingVideo.url,
          descricao: editingVideo.duration
        })
        .eq("id", parseInt(editingVideo.id, 10));

      if (!error) {
        setEditingVideo(null);
        carregarDadosDoBanco();
      } else {
        alert("Erro ao atualizar: " + error.message);
      }
    }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este vídeo?")) return;
    const { error } = await supabase.from("conteudos").delete().eq("id", parseInt(id, 10));
    if (!error) {
      carregarDadosDoBanco();
    } else {
      alert("Erro ao deletar: " + error.message);
    }
  };

  const addDocument = async () => {
    if (newDoc.title && newDoc.url) {
      const { error } = await supabase.from("conteudos").insert([
        { titulo: newDoc.title, url: newDoc.url, descricao: `${newDoc.type} • ${newDoc.pages}`, tipo: "artigo", status: "aprovado" }
      ]);
      if (!error) {
        setNewDoc({ title: "", type: "PDF", pages: "", url: "" });
        carregarDadosDoBanco();
      }
    }
  };

  const updateDocument = async () => {
    if (editingDoc) {
      const { error } = await supabase
        .from("conteudos")
        .update({
          titulo: editingDoc.title,
          url: editingDoc.url,
          descricao: editingDoc.pages
        })
        .eq("id", parseInt(editingDoc.id, 10));

      if (!error) {
        setEditingDoc(null);
        carregarDadosDoBanco();
      }
    }
  };

  const deleteDocument = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este documento?")) return;
    const { error } = await supabase.from("conteudos").delete().eq("id", parseInt(id, 10));
    if (!error) carregarDadosDoBanco();
  };

  const addNews = async () => {
    if (newNews.title) {
      const { error } = await supabase.from("conteudos").insert([
        { titulo: newNews.title, descricao: newNews.excerpt, url: newNews.content, tipo: "pratica", status: "aprovado" }
      ]);
      if (!error) {
        setNewNews({ title: "", date: "", excerpt: "", content: "" });
        carregarDadosDoBanco();
      }
    }
  };

  const updateNews = async () => {
    if (editingNews) {
      const { error } = await supabase
        .from("conteudos")
        .update({
          titulo: editingNews.title,
          descricao: editingNews.excerpt,
          url: editingNews.content
        })
        .eq("id", parseInt(editingNews.id, 10));

      if (!error) {
        setEditingNews(null);
        carregarDadosDoBanco();
      }
    }
  };

  const deleteNews = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta notícia?")) return;
    const { error } = await supabase.from("conteudos").delete().eq("id", parseInt(id, 10));
    if (!error) carregarDadosDoBanco();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Lock className="w-12 h-12 text-accent" />
            </div>
            <CardTitle className="text-2xl" style={{ fontFamily: "Playfair Display" }}>
              Painel Administrativo
            </CardTitle>
            <CardDescription>Acesse com sua senha</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-border"
              />
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white">
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-40 mb-6 rounded-lg shadow-sm">
        <div className="container flex items-center justify-between h-16 px-4">
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "Playfair Display" }}>
            Painel Administrativo Real <span className="text-xs text-green-600 font-sans ml-2">● Supabase Ativo</span>
          </h1>
          <Button variant="outline" size="sm" onClick={() => setIsAuthenticated(false)} className="gap-2">
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </div>
      </div>

      <div className="container mx-auto">
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="videos">Vídeos</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="news">Notícias</TabsTrigger>
          </TabsList>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Adicionar Novo Vídeo no Supabase</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Título do vídeo" value={newVideo.title} onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })} />
                <Input placeholder="URL do YouTube" value={newVideo.url} onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })} />
                <Input placeholder="Duração (ex: 12:34)" value={newVideo.duration} onChange={(e) => setNewVideo({ ...newVideo, duration: e.target.value })} />
                <Button onClick={addVideo} className="w-full bg-accent hover:bg-accent/90 text-white gap-2"><Plus className="w-4 h-4" /> Adicionar Vídeo Real</Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vídeos no Banco de Dados</h3>
              {loading ? <p className="text-sm text-gray-500">Sincronizando mídias...</p> : videos.map((video) => (
                <Card key={video.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{video.title}</h4>
                        <p className="text-xs text-gray-500 truncate max-w-sm">{video.url}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingVideo(video)} className="gap-2">
                          <Edit2 className="w-4 h-4" /> Editar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteVideo(video.id)} className="gap-2">
                          <Trash2 className="w-4 h-4" /> Excluir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Adicionar Novo Documento no Supabase</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Título do documento" value={newDoc.title} onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} />
                <select value={newDoc.type} onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })} className="w-full px-3 py-2 border rounded-md text-sm bg-background">
                  <option>PDF</option><option>Cartilha</option><option>Artigo</option><option>Manual</option>
                </select>
                <Input placeholder="Número de páginas" value={newDoc.pages} onChange={(e) => setNewDoc({ ...newDoc, pages: e.target.value })} />
                <Input placeholder="URL do documento" value={newDoc.url} onChange={(e) => setNewDoc({ ...newDoc, url: e.target.value })} />
                <Button onClick={addDocument} className="w-full bg-accent hover:bg-accent/90 text-white gap-2"><Plus className="w-4 h-4" /> Publicar Documento</Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Documentos Registrados</h3>
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{doc.title}</h4>
                        <p className="text-sm text-muted-foreground">{doc.pages}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingDoc(doc)} className="gap-2">
                          <Edit2 className="w-4 h-4" /> Editar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteDocument(doc.id)} className="gap-2">
                          <Trash2 className="w-4 h-4" /> Remover
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Adicionar Nova Prática Agroecológica</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Título da notícia" value={newNews.title} onChange={(e) => setNewNews({ ...newNews, title: e.target.value })} />
                <Textarea placeholder="Resumo explicativo" value={newNews.excerpt} onChange={(e) => setNewNews({ ...newNews, excerpt: e.target.value })} />
                <Textarea placeholder="Link complementar ou Conteúdo" value={newNews.content} onChange={(e) => setNewNews({ ...newNews, content: e.target.value })} />
                <Button onClick={addNews} className="w-full bg-accent hover:bg-accent/90 text-white gap-2"><Plus className="w-4 h-4" /> Publicar Notícia Real</Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Notícias e Atualizações Ativas</h3>
              {news.map((n) => (
                <Card key={n.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{n.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{n.excerpt}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => setEditingNews(n)} className="gap-2">
                          <Edit2 className="w-4 h-4" /> Editar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteNews(n.id)} className="gap-2">
                          <Trash2 className="w-4 h-4" /> Deletar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* MODAL GLOBAL DE EDIÇÃO DE VÍDEO (REMOVIDO DE DENTRO DO .MAP) */}
      <Dialog open={editingVideo !== null} onOpenChange={(open) => { if (!open) setEditingVideo(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Vídeo no Banco</DialogTitle></DialogHeader>
          {editingVideo && (
            <div className="space-y-4 pt-4">
              <Input value={editingVideo.title} onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })} placeholder="Título" />
              <Input value={editingVideo.url} onChange={(e) => setEditingVideo({ ...editingVideo, url: e.target.value })} placeholder="URL" />
              <Input value={editingVideo.duration} onChange={(e) => setEditingVideo({ ...editingVideo, duration: e.target.value })} placeholder="Duração" />
              <Button onClick={updateVideo} className="w-full bg-accent text-white">Salvar Mudanças</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL GLOBAL DE EDIÇÃO DE DOCUMENTO */}
      <Dialog open={editingDoc !== null} onOpenChange={(open) => { if (!open) setEditingDoc(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Documento</DialogTitle></DialogHeader>
          {editingDoc && (
            <div className="space-y-4 pt-4">
              <Input value={editingDoc.title} onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })} placeholder="Título" />
              <Input value={editingDoc.url} onChange={(e) => setEditingDoc({ ...editingDoc, url: e.target.value })} placeholder="URL" />
              <Input value={editingDoc.pages} onChange={(e) => setEditingDoc({ ...editingDoc, pages: e.target.value })} placeholder="Descrição / Páginas" />
              <Button onClick={updateDocument} className="w-full bg-accent text-white">Salvar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL GLOBAL DE EDIÇÃO DE NOTÍCIA */}
      <Dialog open={editingNews !== null} onOpenChange={(open) => { if (!open) setEditingNews(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Editar Conteúdo Noticioso</DialogTitle></DialogHeader>
          {editingNews && (
            <div className="space-y-4 pt-4">
              <Input value={editingNews.title} onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })} />
              <Textarea value={editingNews.excerpt} onChange={(e) => setEditingNews({ ...editingNews, excerpt: e.target.value })} />
              <Textarea value={editingNews.content} onChange={(e) => setEditingNews({ ...editingNews, content: e.target.value })} />
              <Button onClick={updateNews} className="w-full bg-accent text-white">Atualizar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}