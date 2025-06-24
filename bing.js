// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.129
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["9月3日阅兵 习近平将检阅部队", "人社部：个人养老金领取时需缴纳个税", "村民拍下贵州垮塌大桥事发瞬间", "抗战胜利80周年纪念活动十项安排", "慌张的爸淡定的妈和饥饿的他", "印度外长：邻国要么合作要么付出代价", "特朗普称以伊均违反停火协议", "以方称伊朗违反停火协议 将猛烈回击", "中国长安汽车集团更名", "又一部反腐大剧今晚开播", "中方回应“特朗普称伊以已停火”", "网民编造“果树下现2尸体”被罚", "9月3日盛大阅兵将有三大特点", "内蒙古脑瘫男孩高考601分", "中考870分学霸查分一脸淡定", "航拍：贵州榕江城区大面积被淹", "伊朗对以发动数轮袭击后 停火开始", "小S韩国被偶遇状态令人担忧", "周杰伦晒3岁小女儿萌照", "伊朗宣布胜利 否认停火后发射导弹", "《酱园弄》堆砌明星救不了中国电影", "以色列称停火后伊朗再射导弹", "特朗普突然宣布以伊停火 谁输谁赢", "救援队讲述高速垮塌大桥营救过程", "伊拉克多处军事基地24日凌晨遭袭", "特朗普致电以总理 要求停止攻击伊朗", "榕江最大商场被淹没 洪水如瀑布灌入", "2.8万救护车转运费亲属回应质疑", "考生675分觉得遗憾 爸爸：太行了！", "特朗普突然宣布以伊停火 美高官懵了", "特朗普喊话以色列：别投炸弹", "厦蓉高速一高速桥因持续强降雨垮塌", "柬埔寨公主深圳摘荔枝：最爱糯米糍", "王虹清华大学开讲 丘成桐做开场白", "伊朗：袭击卡塔尔美军基地是自卫", "9月3日天安门举行盛大阅兵", "苹果发布iOS26Beta2", "特朗普宣布以伊停火生效", "贵州遭遇特大洪水 已转移救出84人", "2025河北高考分数线公布", "高速大桥垮塌悬空司机获救全程曝光", "阅兵由徒步、装备方队和空中梯队组成", "以色列总理确认停火", "今年阅兵会有哪些新装备首次亮相", "2025湖南高考分数线", "人民日报：赖清德篡改历史必自取灭亡", "悬停断桥的司机被救后连说“命大”", "从湖南到河南 新消费顶流易主", "以伊达成停火是特朗普一厢情愿吗", "俄外长：以伊停火尚无结论", "伊朗打击美军基地 当地民众尖叫飞奔"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
