
import { perf } from './firebase';
import { trace } from 'firebase/performance';
import { onCLS, onINP, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';

const sendToFirebase = (metric: Metric) => {
    // Use the name directly as the trace name
    const t = trace(perf, `web_vital_${metric.name.toLowerCase()}`);
    t.start();

    // Custom metrics in Firebase Performance need to be integers
    const value = Math.round(metric.value);

    // Record the metric value
    t.putMetric('value', value);
    t.putAttribute('id', metric.id);
    t.putAttribute('navigationType', metric.navigationType);

    // Finish the trace
    t.stop();
};

export const initPerformance = () => {
    try {
        // Capture Web Vitals
        onCLS(sendToFirebase);
        onINP(sendToFirebase);
        onLCP(sendToFirebase);
        onFCP(sendToFirebase);
        onTTFB(sendToFirebase);

        // Track Resources and Cache status
        if ('performance' in window && 'getEntriesByType' in performance) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
                    const cacheTrace = trace(perf, 'resource_stats');
                    cacheTrace.start();

                    let fromCacheCount = 0;
                    let totalCount = resources.length;

                    resources.forEach(res => {
                        // transferSize 0 usually means from cache
                        if (res.transferSize === 0) fromCacheCount++;
                    });

                    cacheTrace.putMetric('total_resources', totalCount);
                    cacheTrace.putMetric('cached_resources', fromCacheCount);

                    const ratio = totalCount > 0 ? Math.round((fromCacheCount / totalCount) * 100) : 0;
                    cacheTrace.putAttribute('cache_ratio', ratio.toString() + '%');
                    cacheTrace.stop();

                    console.log(`📦 Resource Cache Stats: ${fromCacheCount}/${totalCount} from cache`);
                }, 3000);
            });
        }

        console.log('🚀 Firebase Performance monitoring initialized');
    } catch (error) {
        console.warn('⚠️ Performance monitoring initialization failed:', error);
    }
};
