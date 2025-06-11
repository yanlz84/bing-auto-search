// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.103
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
var default_search_words = ["万里丝路颂长歌", "城乡居民医保补助提至每人每年700元", "高考结束挑行李回家的女生发声", "构建网络“同心圆”", "马斯克反悔：对特朗普说的话太过分", "余承东：新手机绝对对得起那四个字", "网警：当心你的隐私被“共享”", "洛杉矶已面目全非", "央视主持人水均益回国 龙凤胎罕露面", "高考后这些信息不要晒", "台湾海域5.8级地震 福建震感明显", "男子造谣自己困电梯3小时被约谈", "上汽承诺支付账期统一至60天内", "妈妈分享孩子高考前后伙食对比", "以军在加沙物资分发点开火致20死", "双航母为何远赴西太平洋？专家解读", "今年第1号台风“蝴蝶”路径图", "向佐在线辟谣：这不是我老婆好吗", "曝名字都带yu的男女顶流曾在一起过", "女孩高考后才知爷爷去世跪地痛哭", "迪丽热巴因一句台词一夜涨粉200万", "洛杉矶骚乱商店被抢劫 苹果阿迪遭殃", "影石创新登陆科创板总市值超700亿元", "台网红馆长给同行人科普磁悬浮列车", "男生带妈妈遗照参加高考 其父亲回应", "小沈阳女儿将韩国solo出道", "76岁大爷健身42年：感谢妻子支持", "浙江一村干部工作途中不慎落水失联", "食用未成熟荔枝或引发急性低血糖", "医院：7月至9月是蛇伤高发期", "前国脚谢晖入驻百度", "广东汕头铺面火灾致3死 亲属发声", "高考结束什么时候最紧张", "《东极岛》倪妮造型颠覆以往形象", "高考是人生的另一个起点", "台湾网红被投喂“大陆美食三件套”", "#董浩说人生不止高考学门手艺也好#", "女生高考完独自挑一扁担行李回家", "00后民警冲上7楼踹门救3岁娃", "网红解释问黄子韬离婚的原因", "林昀儒一个词形容王楚钦梁靖崑", "男子骑车时速35码撞人致失忆判赔30万", "海口“三港”于6月12日11时起停运", "爸爸帮抢不到货的女儿复刻LABUBU", "台风“蝴蝶”最强可达12级", "“市市通高铁”轮到这个省了", "60天账期对车企发展有何影响", "洛杉矶珠宝店入夜前用木板封堵门窗", "台湾网红到上海首日遭绿营围攻", "俄乌称在多地拦截和击落对方无人机", "华为发布首款鸿蒙AI智能手表"]

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
