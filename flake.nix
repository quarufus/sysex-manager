{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
  };

  outputs =
    inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } ({
      systems = [
        "x86_64-linux"
        "aarch64-darwin"
      ];
      perSystem =
        { pkgs, ... }:
        {
          devShells.default = pkgs.mkShell {
            buildInputs = [
              pkgs.nodePackages.nodejs
              pkgs.nodePackages.typescript-language-server
              pkgs.tailwindcss-language-server
              pkgs.svelte-language-server
            ];
          };
        };
    });
}
