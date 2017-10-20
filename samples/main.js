import Eb from '../src/earlybirds';

(function(w) {
  w.eb = new Eb();
  w.eb.init('trackerKey');
  var profile = {
    datasources: [{
      id: 'datasourceId'
    }],
  }
  w.eb.identify(profile)
    .then(() => {
      w.eb.getRecommendations('widgetId')
        .then((recos) => {
        });
    });
})(window);
