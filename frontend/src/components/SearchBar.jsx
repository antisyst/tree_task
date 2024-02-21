import PropTypes from 'prop-types';

const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <input
      type="text"
      placeholder="Search by name..."
      value={searchTerm}
      className="search_bar"
      onChange={(e) => onSearchChange(e.target.value)}
    />
  );
};

SearchBar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
};

export default SearchBar;
