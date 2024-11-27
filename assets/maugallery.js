(function($) {
  $.fn.mauGallery = function(options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function() {
      // Crée le conteneur pour les éléments de la galerie
      $.fn.mauGallery.methods.createRowWrapper($(this));
      
      if (options.lightBox) {
        // Crée la modale (lightbox) avec navigation (si activée)
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }
      
      $.fn.mauGallery.listeners(options);

      // Parcours chaque élément de la galerie et le prépare
      $(this)
        .children(".gallery-item")
        .each(function(index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      $(this).fadeIn(500);
    });
  };

  // Options par défaut pour la galerie
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  // Ajout des événements nécessaires pour la galerie
  $.fn.mauGallery.listeners = function(options) {
    // Lorsque l'utilisateur clique sur une image, ouvrir la modale
    $(".gallery-item").on("click", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    // Clic sur les liens de tags pour filtrer les images
    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);

    // Navigation dans la modale : clic sur les boutons "précédent" et "suivant"
    $(".gallery").on("click", ".mg-prev", function() {
      $.fn.mauGallery.methods.prevImage(options.lightboxId); // Fonction pour afficher l'image précédente
    });

    $(".gallery").on("click", ".mg-next", function() {
      $.fn.mauGallery.methods.nextImage(options.lightboxId); // Fonction pour afficher l'image suivante
    });
  };

  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (
        !element
          .children()
          .first()
          .hasClass("row")
      ) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },

    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },

    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },

    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },

    // Ouvre la modale avec l'image sélectionnée
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },

    // Fonction pour afficher l'image précédente dans la modale
    prevImage(lightboxId) {
      let activeImage = $(".lightboxImage").attr("src"); // Récupérer l'URL de l'image actuelle
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle"); // Récupérer le tag actif
      let imagesCollection = [];

      // Récupérer toutes les images selon le tag actif
      if (activeTag === "all") {
        $(".item-column img").each(function() {
          imagesCollection.push($(this));
        });
      } else {
        $(".item-column img").each(function() {
          if ($(this).data("gallery-tag") === activeTag) {
            imagesCollection.push($(this));
          }
        });
      }

      // Trouver l'index de l'image active dans la collection
      let index = imagesCollection.findIndex(function(img) {
        return $(img).attr("src") === activeImage;
      });

      // Récupérer l'image précédente (ou la dernière image si c'est la première)
      let prevImage = imagesCollection[index - 1] || imagesCollection[imagesCollection.length - 1];

      // Mettre à jour l'image dans la modale
      $("#" + lightboxId).find(".lightboxImage").attr("src", $(prevImage).attr("src"));
    },

    // Fonction pour afficher l'image suivante dans la modale
    nextImage(lightboxId) {
      let activeImage = $(".lightboxImage").attr("src"); // Récupérer l'URL de l'image actuelle
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle"); // Récupérer le tag actif
      let imagesCollection = [];

      // Récupérer toutes les images selon le tag actif
      if (activeTag === "all") {
        $(".item-column img").each(function() {
          imagesCollection.push($(this));
        });
      } else {
        $(".item-column img").each(function() {
          if ($(this).data("gallery-tag") === activeTag) {
            imagesCollection.push($(this));
          }
        });
      }

      // Trouver l'index de l'image active dans la collection
      let index = imagesCollection.findIndex(function(img) {
        return $(img).attr("src") === activeImage;
      });

      // Récupérer l'image suivante (ou la première image si c'est la dernière)
      let nextImage = imagesCollection[index + 1] || imagesCollection[0];

      // Mettre à jour l'image dans la modale
      $("#" + lightboxId).find(".lightboxImage").attr("src", $(nextImage).attr("src"));
    },

    // Créer la modale (lightbox) avec les boutons de navigation si activés
    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${
        lightboxId ? lightboxId : "galleryLightbox"
      }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                                ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${
                              navigation
                                ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                                : '<span style="display:none;" />'
                            }
                        </div>
                    </div>
                </div>
            </div>`);
    },

    // Afficher les tags de la galerie (si activé)
    showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item active">
                <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      }
    },

    // Filtrer les images par tag
    filterByTag(event) {
      $(".tags-bar span").removeClass("active-tag");
      $(event.target).addClass("active-tag");
      let selectedTag = $(event.target).data("images-toggle");

      $(".gallery-item").each(function() {
        if (
          selectedTag === "all" ||
          $(this).data("gallery-tag") === selectedTag
        ) {
          $(this).show();
        } else {
          $(this).hide();
        }
      });
    }
  };
})(jQuery);
