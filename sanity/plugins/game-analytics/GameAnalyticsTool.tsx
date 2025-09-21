import { useClient } from 'sanity';

export default function GameAnalyticsTool() {
    const client = useClient({ apiVersion: '2024-01-01' });

    // Get project info for Hex
    const projectId = client.config().projectId;
    const dataset = client.config().dataset;

    // Your Hex dashboard URL - you'll get this after publishing in Hex
    const hexDashboardUrl =
        'https://app.hex.tech/01984ea3-64a2-7006-b4b4-ca0873345132/app/030b0a5bbaF2QdhCw4RhG3/latest';

    return (
        <section style={{ height: '100%' }}>
            <iframe
                src={`${hexDashboardUrl}?projectId=${projectId}&dataset=${dataset}`}
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block',
                }}
                allow='fullscreen'
            />
        </section>
    );
}
