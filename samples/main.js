import Eb from '../src/earlybirds';

(function(w) {
    w.eb = new Eb();
    w.eb.init('[TRACKER_KEY]');
    var profile = {
        datasources: [{
            id: '[DATASOURCE_ID]'
        },
    }
    w.eb.identify(profile)
    .then(() => {
      /*
             w.eb.trackActivity({
             original_id : 'TROI075',
             verb: 'view'
             });
             */
    });
})(window);

