define(['goog.userAgent.js'], function(goog_userAgent) {
    var goog = {};
    goog.format = {
         insertWordBreaks: function (str, maxCharsBetweenWordBreaks) {
             str = String(str);

             var resultArr = [];
             var resultArrLen = 0;

             // These variables keep track of important state inside str.
             var isInTag = false;  // whether we're inside an HTML tag
             var isMaybeInEntity = false;  // whether we might be inside an HTML entity
             var numCharsWithoutBreak = 0;  // number of chars since last word break
             var flushIndex = 0;  // index of first char not yet flushed to resultArr

             for (var i = 0, n = str.length; i < n; ++i) {
                 var charCode = str.charCodeAt(i);

                 // If hit maxCharsBetweenWordBreaks, and not space next, then add <wbr>.
                 if (numCharsWithoutBreak >= maxCharsBetweenWordBreaks &&
                     // space
                     charCode != 32) {
                     resultArr[resultArrLen++] = str.substring(flushIndex, i);
                     flushIndex = i;
                     resultArr[resultArrLen++] = goog.format.WORD_BREAK;
                     numCharsWithoutBreak = 0;
                 }

                 if (isInTag) {
                     // If inside an HTML tag and we see '>', it's the end of the tag.
                     if (charCode == 62) {
                         isInTag = false;
                     }

                 } else if (isMaybeInEntity) {
                     switch (charCode) {
                         // Inside an entity, a ';' is the end of the entity.
                         // The entity that just ended counts as one char, so increment
                         // numCharsWithoutBreak.
                         case 59:  // ';'
                             isMaybeInEntity = false;
                             ++numCharsWithoutBreak;
                             break;
                         // If maybe inside an entity and we see '<', we weren't actually in
                         // an entity. But now we're inside and HTML tag.
                         case 60:  // '<'
                             isMaybeInEntity = false;
                             isInTag = true;
                             break;
                         // If maybe inside an entity and we see ' ', we weren't actually in
                         // an entity. Just correct the state and reset the
                         // numCharsWithoutBreak since we just saw a space.
                         case 32:  // ' '
                             isMaybeInEntity = false;
                             numCharsWithoutBreak = 0;
                             break;
                     }

                 } else {  // !isInTag && !isInEntity
                     switch (charCode) {
                         // When not within a tag or an entity and we see '<', we're now
                         // inside an HTML tag.
                         case 60:  // '<'
                             isInTag = true;
                             break;
                         // When not within a tag or an entity and we see '&', we might be
                         // inside an entity.
                         case 38:  // '&'
                             isMaybeInEntity = true;
                             break;
                         // When we see a space, reset the numCharsWithoutBreak count.
                         case 32:  // ' '
                             numCharsWithoutBreak = 0;
                             break;
                         // When we see a non-space, increment the numCharsWithoutBreak.
                         default:
                             ++numCharsWithoutBreak;
                             break;
                     }
                 }
             }

             // Flush the remaining chars at the end of the string.
             resultArr[resultArrLen++] = str.substring(flushIndex);

             return resultArr.join('');
         },
         /**
          * String inserted as a word break by insertWordBreaks(). Safari requires
          * <wbr></wbr>, Opera needs the 'shy' entity, though this will give a
          * visible hyphen at breaks. Other browsers just use <wbr>.
          * @type {string}
          * @private
          */
         WORD_BREAK: goog_userAgent.WEBKIT
             ? '<wbr></wbr>' : goog_userAgent.OPERA ? '&shy;' : '<wbr>'
     };

    return goog.format
});