import Link from "next/link";
import { getUniv } from "../db";
import { getFreeRooms, preloadRoomsData } from "../actions";

export default async function UniversityPage({ univ }) {
    try {
        const univs = await getUniv();
        const univExists = univs.find(univ_res => univ_res.univ === univ);
        
        if (!univExists) {
            return (
                <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
                    <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                        Cette université n'existe pas
                    </main>
                </div>
            );
        }

        // Lancer le préchargement en arrière-plan (sans attendre)
        preloadRoomsData(univ).catch(console.warn);
        
        const roomsResult = await getFreeRooms(null, null, univ);
        
        const totalRooms = Object.keys(roomsResult.freeRooms).length + 
                           Object.keys(roomsResult.usedRooms).length + 
                           Object.keys(roomsResult.invalidRooms).length;
        
        const freeCount = Object.keys(roomsResult.freeRooms).length;
        const usedCount = Object.keys(roomsResult.usedRooms).length;
        
        return (
            <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
                <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-4xl w-full">
                    <div className="w-full text-center">
                        <h1 className="text-3xl font-bold mb-4">Université {univ}</h1>
                        <div className="bg-gray-100 rounded-lg p-4 mb-6">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-green-600">{freeCount}</div>
                                    <div className="text-sm text-gray-600">Salles libres</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-red-600">{usedCount}</div>
                                    <div className="text-sm text-gray-600">Salles occupées</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">{totalRooms}</div>
                                    <div className="text-sm text-gray-600">Total des salles</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8 w-full">
                        <div className="bg-green-50 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-green-800 mb-4">
                                🟢 Salles libres ({freeCount})
                            </h2>
                            <div className="space-y-2">
                                {Object.keys(roomsResult.freeRooms).length > 0 ? (
                                    Object.keys(roomsResult.freeRooms).map(roomName => (
                                        <Link 
                                            key={roomName} 
                                            href={`/room/${roomName}`} 
                                            className="block p-3 bg-white rounded border border-green-200 hover:border-green-400 hover:shadow-md transition-all"
                                        >
                                            <div className="font-medium text-green-700">{roomName}</div>
                                            <div className="text-sm text-green-600">Disponible maintenant</div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center text-green-600 py-8">
                                        Aucune salle libre pour le moment
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="bg-red-50 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-red-800 mb-4">
                                🔴 Salles occupées ({usedCount})
                            </h2>
                            <div className="space-y-2">
                                {Object.keys(roomsResult.usedRooms).length > 0 ? (
                                    Object.keys(roomsResult.usedRooms).map(roomName => (
                                        <Link 
                                            key={roomName} 
                                            href={`/room/${roomName}`} 
                                            className="block p-3 bg-white rounded border border-red-200 hover:border-red-400 hover:shadow-md transition-all"
                                        >
                                            <div className="font-medium text-red-700">{roomName}</div>
                                            <div className="text-sm text-red-600">
                                                Libre à {roomsResult.usedRooms[roomName].willBeFree}
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center text-red-600 py-8">
                                        Toutes les salles sont libres !
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {Object.keys(roomsResult.invalidRooms).length > 0 && (
                        <div className="w-full bg-yellow-50 rounded-lg p-4">
                            <h3 className="text-lg font-medium text-yellow-800 mb-2">
                                ⚠️ Salles avec des problèmes de données ({Object.keys(roomsResult.invalidRooms).length})
                            </h3>
                            <div className="text-sm text-yellow-700">
                                {Object.keys(roomsResult.invalidRooms).join(', ')}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        );
    } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        return (
            <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
                <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                    Erreur lors du chargement des données
                </main>
            </div>
        );
    }
}
