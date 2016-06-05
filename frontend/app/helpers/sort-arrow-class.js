import Ember from "ember";

export default Ember.Helper.helper(function([column, sortColumn, sortReverse]) {
  if (sortColumn === column) {
    return sortReverse ? 'sorted-desc' : 'sorted-asc';
  }
});
