import { useState } from 'react';
import { ChatBot } from './components/ChatBot';
import { Pet } from './types';
import './index.css';

function App() {
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Örnek veri
    const samplePet: Pet = {
        id: '123',
        name: 'Pamuk',
        type: 'Kedi',
        description: '3 yaşında, sakin, kısırlaştırılmış, apartman hayatına uygun, tekir kedi.'
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4 text-gray-800">Evcil Hayvan Sahiplendirme</h1>
                <p className="text-lg text-gray-600 mb-8">
                    Bu bir demo sayfasıdır. Sağ alt köşedeki ChatBot ile etkileşime geçebilirsiniz.
                </p>
                <div className="bg-white p-6 rounded-lg shadow-md max-w-sm mx-auto">
                    <img
                        src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2F0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
                        alt="Pamuk"
                        className="w-full h-48 object-cover rounded-md mb-4"
                    />
                    <h2 className="text-2xl font-bold mb-2">{samplePet.name}</h2>
                    <p className="text-gray-600">{samplePet.description}</p>
                </div>
            </div>

            <ChatBot
                pet={samplePet}
                isOpen={isChatOpen}
                onOpenChange={setIsChatOpen}
            />
        </div>
    );
}

export default App;
